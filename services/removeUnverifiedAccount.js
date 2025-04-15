import cron from "node-cron";
import {User} from "../models/userModel.js";

export const removeUnverifedAccount = () => {
    cron.schedule("*/5 * * * *", async () => {
        const thirtyTimeAgo = new Date(Date.now() - 30 * 60 * 1000);
        await User.deleteMany({
            accountVerified: false,
            createdAt: {
                $lt: thirtyTimeAgo
            },
        });
    })
};