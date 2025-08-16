const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middlewares/auth/auth")
const userController = require("../controllers/user.controller");

//get all users -admin
router.get("/", userController.getAllusers);

//get user profile
router.get("/profile/me", auth, userController.getuserProfile);

//update user profile
router.put("/edit-profile/:id", auth, userController.updateuserProfile);

//suspend/unsuspend user
router.get("/suspend-unsuspend/:id", auth, userController.suspensionToggler);

//delete user account
router.delete("/:id", auth, userController.deleteUser);

//get user statistics
router.get("/get/statistics", auth, admin, userController.getuserStatistics);

module.exports = router;
