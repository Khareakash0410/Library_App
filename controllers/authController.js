import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generatePasswordEmailTemplate } from "../utils/emailTemplates.js";
import {v2 as cloudinary} from "cloudinary";




export const register = catchAsyncErrors(async(req, res, next) => {
   try {

    if(!req.files || Object.keys(req.files).length === 0)  {
      return next(new ErrorHandler("Avatar is required.", 400));
    };
    
    const {name, email, password} = req.body;

    const isRegistered = await User.findOne({email, accountVerified: true});

    if(isRegistered) {
        return next(new ErrorHandler("User already exists.", 400));
    }

    const registrationAttemptsByUser  = await User.find({
        email,
        accountVerified: false
    });

    if (registrationAttemptsByUser.length >= 5) {
        return next(new ErrorHandler("You have exceeded the number of registration limits. Please try after sometime.", 400));
    };

    const {avatar} = req.files;
    const allowedFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
  
    if (!allowedFormat.includes(avatar.mimetype)) {
      return next(new ErrorHandler("File format not supported.", 400));
    };

    const hashedPassword = await bcrypt.hash(password, 10);

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
        password: hashedPassword,
        avatar: {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        },
    });

    const verificationCode = await user.generateVerificationCode();

    await user.save();
    sendVerificationCode(verificationCode, email, res);

   } catch (error) {
    next(error);
   }
});


export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
    const {email, otp} = req.body;

    try {
       const userAllEntries = await User.find({
        email,
        accountVerified: false,
       }).sort({ createdAt: -1 });

       if (!userAllEntries) {
        return next(new ErrorHandler("User not found.", 404));
       }

       let user;

       if(userAllEntries.length > 1) {
        user = userAllEntries[0];

        await User.deleteMany({
            _id: {$ne: user._id},
            email,
            accountVerified: false
        });
       }  else {
        user = userAllEntries[0];
       }

       if (user.verificationCode !== Number(otp)) {
        return next(new ErrorHandler("Invalid otp.", 400));
       }

       const currentTime = Date.now();

       const verificationCodeExpires = new Date(user.    verificationCodeExpire).getTime();

       if(currentTime > verificationCodeExpires) {
        return next(new ErrorHandler("Otp expired", 400));
       }

       user.accountVerified = true;
       user.verificationCode = null;
       user.verificationCodeExpire = null;

       await user.save({validateModifiedOnly: true});

       sendToken(user, 200, "Account Verified", res);

    } catch (error) {
        return next(new ErrorHandler("Internal server error.", 500));
    }
});


export const login = catchAsyncErrors(async (req, res, next) => {
     const {email, password} = req.body;

     const user = await User.findOne({
        email,
        accountVerified: true,
     }).select("+password");

     if (!user) {
        return next(new ErrorHandler("Invalid email.", 400));
     }

     const isPasswordMatched = await bcrypt.compare(password, user.password);

     if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password.", 400));
     }

     sendToken(user, 200, "User login successfully", res);
});


export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  }).json({
    success: true,
    message: "Logged out successfully"
  });
});  



export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;

    res.status(200).json({
        success: true,
        user
    });
});


export const forgotPassword = catchAsyncErrors(async (req, res, next) => {

   const user = await User.findOne({
    email: req.body.email,
    accountVerified: true
   });

   if(!user) {
    return next(new ErrorHandler("Invalid email", 400));
   }

   const resetToken = user.getResetPasswordToken();

   await user.save({validateBeforeSave: false});

   const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

   const message = generatePasswordEmailTemplate(resetPasswordUrl);

   try {
    await sendEmail({email: user.email, subject: "ReadULike Library System Password Recovery", message});

    res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`
    });

   } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({validateBeforeSave: false});
    return next(new ErrorHandler(error.message, 500));
   }
});


export const resetPassword = catchAsyncErrors(async (req, res, next) => {
   const {token} = req.params;
   const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

   const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now()}
   });

   if (!user) {
    return next(new ErrorHandler("Token is invalid or expired.", 400));
   };

   const hashedPassword = await bcrypt.hash(req.body.password, 10);

   user.password = hashedPassword;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;

   await user.save();

   sendToken(user, 200, "Password reset successfully", res);
});


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
   
  const {currentPassword, newPassword} = req.body;

  const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current password is incorrect.", 400));
  };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password updated successfully"
  });
});

