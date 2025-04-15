import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { sendEmail } from "../utils/sendEmail.js";



export const notifyUsers = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const borrowers = await Borrow.find({
            dueDate: { $lt: oneDayAgo},
            returnDate: null,
            notified: false,
        });
        for(const element of borrowers) {
            if(element.user && element.user.email) {
                sendEmail({
                    email: element.user.email,
                    subject: "Book Due Date Reminder",
                    message: `Hello ${element.user.name}, your borrowed book is due for return. \n \n Please return it as soon as possible.\n \n Thank you!`
                });
                element.notified = true;
                await element.save();
            }
        }
    } catch (error) {
        console.log("Some error occured while notifying users", error);  
    }
  });
};