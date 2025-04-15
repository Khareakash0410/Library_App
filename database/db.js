import mongoose from "mongoose";



export const connectToDb = () => {
   mongoose.connect(process.env.MONGO_URI, {
    dbName: "LIBRARY_APP"
   }).then(() => {
     console.log("Database Connected Successfully.");
   }).catch((err) => {
    console.log("Error Connecting Database", err);  
   })
};