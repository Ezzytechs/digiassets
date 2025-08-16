const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN} = process.env;
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim:true,
      lowercase:true,
      unique: [true, "User with this username already exist!"],
      required: [true, "Username cannot be empty!"],
      minlength: [5, "Username must be at least 5 characters!"],
    },
    fullName: { fName: String, lName: String },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    phone: {
      type: String,
      trim:true,
    },
    avatar: { type: String },
    gender: String,
    dob:Date,
    email: {
      type: String,
      lowercase:true,
      required: [true, "Email cannot be empty!"],
      unique: [true, "User with this email already exist!"],
      match: [/^\S+@\S+\.\S+$/, "Please provide valid email address!"],
      trim: true,
      index:true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password cannot be empty!"],
    },
    otp:{
      otpCode:Number,
      otpExpires:Date,},
    isAdmin: { type: Boolean, default: false },
    isSuspended:{type:Boolean, default:false}
  },
  { timestamps: true }
);
userSchema.index({ username: 1, email: 1 }, { unique: true });

userSchema.methods.generateAuthTokens = async function () {
  const user = this;

  const payload = {
    userId: user._id,
    username: user.username,
    email:user.email,
    isAdmin: user.isAdmin,
  };

  const accessToken =await jwt.sign(payload, JWT_ACCESS_TOKEN, {
    expiresIn: "30d",
  });

  const refreshToken =await jwt.sign(payload, JWT_REFRESH_TOKEN, {
    expiresIn: "15m",
  });
  return { accessToken, refreshToken };
};

userSchema.methods.setRefreshTokenCookie = function (res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 21 * 24 * 60 * 60 * 1000, // 21 days
  });
};

userSchema.methods.suspendUser=async function (){
  const user=this
  user.isSuspended=true
  await user.save()
}
exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
// module.exports = mongoose.model("Order", orderSchema);

// userSchema.methods.generateOTP = async function (otpType) {
//   const user = this;
//   const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

//   user.otp.push({ otpType, otpCode, otpExpires });
//   await user.save();

//   return { otpCode, otpExpires };
// };
