import express from "express";
import {config} from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToDb } from "./database/db.js";
import {errorMiddleware} from "./middleware/errorMiddleware.js"
import authRouter from "./routes/authRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import borrowRouter from "./routes/borrowRoute.js";
import userRouter from "./routes/userRoute.js";
import expressFileUpload from "express-fileupload";
import { notifyUsers } from "./services/notifyUsers.js";
import { removeUnverifedAccount } from "./services/removeUnverifiedAccount.js";


export const app = express();

config({path: "./config/config.env" });


app.use(cors({
    origin: [
        process.env.FRONTEND_URL
    ],
    methods: [
        "GET", "POST", "PUT", "DELETE"
    ],
    credentials: true,
}));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(expressFileUpload(
    {
        useTempFiles: true,
        tempFileDir: "/tmp/"
    }
));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/user", userRouter);

notifyUsers();
removeUnverifedAccount();

connectToDb();

app.use(errorMiddleware);

