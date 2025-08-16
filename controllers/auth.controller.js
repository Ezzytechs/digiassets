const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User } = require("../models/users.model");
const Wallet = require("../models/wallet.model");
const emailObserver = require("../utils/observers/email.observer");
const { sendEmail } = require("../utils/mailer/mailer");
const emailTemplate = require("../utils/mailer/templates");
const credentials = require("../configs/credentials");

exports.register = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const rule =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!rule.test(req.body.password)) {
      return res.status(400).json({
        message:
          "Password must include at least one uppercase letter, one lowercase letter, one digit, one special character and be at least 6 characters long",
      });
    }
   const userExit=await User.findOne({username:req.body.username})
  
   console.log(userExit)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      ...req.body,
      password: hashedPassword,
      isAdmin: true,
    });

    const newUser = await user.save(); // save user in the session
    if(!newUser) return res.status(400).json({message:"Unable to register new user!"})
    // await user.save({ session }); // save user in the session

    // const wallet = new Wallet({ owner: user._id });
    // await wallet.save();

    // save wallet in same session
    // await new Wallet({ owner: user._id }).save({ session }); // save wallet in same session
    // await session.commitTransaction();
    // session.endSession();

    const { accessToken, refreshToken } = await newUser.generateAuthTokens();

    newUser.setRefreshTokenCookie(res, refreshToken);

    // //send mail to new user
    // emailObserver.emit("SEND_MAIL", {
    //   to: user.email,
    //   subject: `Welcome ${user.username}`,
    //   templateFunc: () =>
    //     emailTemplate.welcomeMessage(
    //       user.username,
    //       credentials.siteName,
    //       credentials.loginURL,
    //       credentials.supportEmail
    //     ),
    // });
    res.status(201).json({ message: "Success", accessToken});
  } catch (err) {
    if (err.code === 11000) {
      const fieldName = Object.keys(err.keyValue)[0];
      res
        .status(400)
        .json({ message: `User with ${fieldName} already exists!` });
      return;
    }
    if (err.name === "ValidationError") {
      const customMessage = Object.values(err.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ message: customMessage[0] });
    }
   const mongooseErr=err.toString().split(":")[1]
    return res.status(500).json({ message:mongooseErr});
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = await user.generateAuthTokens();
    await user.setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({ accessToken, success: true });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await User.findById(req.user.userId);
    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Generate OTP for password reset
exports.generateOTP = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    const userOtp = {
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    }; // 10 min
    user.otp=userOtp;
    await user.save();
    // console.log(otp);
    // sendEmail(
    //   user.email,
    //   "Reset your password",
    //   emailTemplate.forgotPassword(
    //     user.stageName,
    //     otp,
    //     credentials.siteName,
    //     credentials.supportEmail
    //   )
    // );

    return res.status(200).json({ message: "OTP has been sent" });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Reset password function to verify OTP and update password
exports.resetPassword = async (req, res) => {
  try {
    const { otp, password } = req.body;
    Number(otp)
    const user = await User.findOne({
      "otp.otpCode": otp,
      "otp.otpExpires": { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(password, 10);
    user.otp = {otpCode:null, otpExpires:null}
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Update email
exports.changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.email = newEmail;
    await user.save();

    return res.status(200).json({ message: "Email changed successfully" });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//Generate new access token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.REFRESH_SECRET, async (err, payload) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findById(payload.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { accessToken, refreshToken } = user.generateAuthTokens();
      user.setRefreshTokenCookie(res, refreshToken);

      return res.status(200).json({ accessToken });
    });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
