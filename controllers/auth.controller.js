const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/users.model");
const Wallet = require("../models/wallet.model");
const PendingUser = require("../models/pendingUser.model");
const emailTemplate = require("../utils/mailer");
const emailObserver = require("../utils/observers/email.observer");
const credentials = require("../configs/credentials");
exports.sendRegOtp = async (req, res) => {
  try {
    const { email } = req.body;
    //verify email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const existingPendingUser = await PendingUser.findOne({ email });
    if (existingPendingUser) {
      console.log({ otp: existingPendingUser.otp });
      // Mail data for template
      const mailData = {
        userName: email.split("@")[0], // fallback: use first part of email
        otp: existingPendingUser.otp,
      };
      // Send email
      emailObserver.emit("SEND_MAIL", {
        to: existingPendingUser.email,
        subject: "🔔 Your OTP Code",
        templateFunc: emailTemplate.registrationOtpTemplate,
        templateData: mailData,
      });
      return res.status(200).json({ success: true });
    } else {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return res
          .status(400)
          .json({ message: "User with this email already exist" });
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log({ otp });

      // Upsert pending user
      const user = await PendingUser.findOneAndUpdate(
        { email },
        {
          email,
          otp,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        { new: true, upsert: true }
      );

      // Mail data for template
      const mailData = {
        userName: email.split("@")[0], // fallback: use first part of email
        otp,
      };

      // Send email
      emailObserver.emit("SEND_MAIL", {
        to: user.email,
        subject: "🔔 Your OTP Code",
        templateFunc: emailTemplate.registrationOtpTemplate,
        templateData: mailData,
      });

      res
        .status(200)
        .json({ message: "OTP sent successfully", success: true, email });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyRegOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res
        .status(404)
        .json({ error: "No pending registration found for this email" });
    }

    // Check expiration (MongoDB TTL may already delete, but double-check)
    if (pendingUser.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }
    // Check OTP
    if (pendingUser.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP verified ✅
    return res.status(200).json({
      message: "OTP verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

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
    const userExit = await User.findOne({ username: req.body.username });
    if (userExit)
      return res
        .status(400)
        .json({ message: "user with this usename already exit!" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      ...req.body,
      "address.country": req.body.country,
      password: hashedPassword,
      isAdmin: false,
    });

    const newUser = await user.save();
    if (!newUser)
      return res.status(400).json({ message: "Unable to register new user!" });

    const wallet = new Wallet({ owner: user._id });
    await wallet.save();

    const { accessToken, refreshToken } = await newUser.generateAuthTokens();

    newUser.setRefreshTokenCookie(res, refreshToken);

    //send mail to new user
    emailObserver.emit("SEND_MAIL", {
      to: user.email,
      subject: `Welcome ${user.username}`,
      templateFunc: emailTemplate.registrationSuccessTemplate,
      templateData: {
        userName: user.username,
        assetPageUrl: `${credentials.appUrl}/asets`,
      },
    });
    res.status(201).json({ message: "Success", accessToken });
  } catch (err) {
    console.log(err);
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
    const mongooseErr = err.toString().split(":")[1];
    return res.status(500).json({ message: mongooseErr });
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
    const time = new Date().toLocaleString();
    const ip = req.ip;

    emailObserver.emit("SEND_MAIL", {
      to: user.email,
      subject: "🔔 New Login Notification",
      templateFunc: emailTemplate.loginNotificationTemplate,
      templateData: { userName: user.username, ip, time },
    });

    return res.status(200).json({ accessToken, success: true });
  } catch (err) {
    console.log(err);
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

    const userOtp = {
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    };
    user.otp = userOtp;
    await user.save();

    const mailData = {
      userName: user.username,
      otp: otp,
    };

    emailObserver.emit("SEND_MAIL", {
      to: user.email,
      subject: "🔔 Your OTP Code",
      templateFunc: emailTemplate.otpTemplate,
      templateData: mailData,
    });

    return res.status(200).json({ message: "OTP has been sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Reset password function to verify OTP and update password
exports.resetPassword = async (req, res) => {
  try {
    const { otp, password } = req.body;
    Number(otp);
    const user = await User.findOne({
      "otp.otpCode": otp,
      "otp.otpExpires": { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(password, 10);
    user.otp = { otpCode: null, otpExpires: null };
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
  } catch (err) {
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
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
