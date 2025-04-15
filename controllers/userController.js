import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";


export const getUsers = catchAsyncErrors(async (req, res, next) => {
   const users = await User.find({accountVerified: true});
   res.status(200).json
   ({
    success: true,
    users,
   });
});


export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if(!req.files || Object.keys(req.files).length === 0)  {
    return next(new ErrorHandler("Admin avatar is required.", 400));
  };

  const {name, email, password} = req.body;

  const exisitngUser = await User.findOne({email, accountVerified: true});

  if (exisitngUser) {
    return next(new ErrorHandler("User already exists", 400));
  };

  const {avatar} = req.files;
  const allowedFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

  if (!allowedFormat.includes(avatar.mimetype)) {
    return next(new ErrorHandler("File format not supported.", 400));
  };

  const hasehdPassword = await bcrypt.hash(password, 10);
  const cloudinaryResponse = await cloudinary.uploader.upload(
    avatar.tempFilePath, {folder: "LIBRARY_ADMIN"},
   );

   if(!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown cloudinary error");
    return next(new ErrorHandler("Failed to upload avatar", 500));
   };

   const user = await User.create({
    name,
    email,
    password: hasehdPassword,
    role: "Admin",
    accountVerified: true,
    avatar: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
    },
   });

   res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    user,
   });
});