const express = require("express");
const router = express.Router();
const {auth} = require("../middlewares/auth/auth");
const authController = require("../controllers/auth.controller");

//register user
router.post("/register", authController.register);

//user login
router.post("/login", authController.login);

//update password
router.put("/update/password", auth, authController.updatePassword);

//generate otp for password reset
router.post("/generate-otp", authController.generateOTP);

//reset password
router.post("/password/reset", authController.resetPassword);

//update email
router.post("/change/email", auth, authController.changeEmail);

//generate new access token
router.get("/refresh-token", authController.refreshToken);

//logout user
router.get("/logout", authController.logout);

module.exports = router;
