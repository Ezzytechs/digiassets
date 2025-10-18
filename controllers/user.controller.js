const { User } = require("../models/users.model");
const Wallet = require("../models/wallet.model");
const  Asset  = require("../models/assets.model");
const { deleteFile } = require("../utils/fileStorage");
const { sendEmail } = require("../utils/mailer/mailer");
const credentials = require("../configs/credentials");
const {paginate} = require("../utils/pagination")

//Get all users
exports.getAllusers = async (req, res) => {
  try {
    let { limit = 20, page = 1, ...query } = req.query || {};
    const options = {
      filter: { ...query },
      limit,
      page,
      select: "username email isAdmin phone isSuspended",
    };
    const users = await paginate(User, options);
    const wallet = await paginate(Wallet, options);
    if (!users || users.length === 0)
      return res.status(404).json({ message: "No user found" });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile
exports.getuserProfile = async (req, res) => {
  try {
    const id = req.user.isAdmin && req.query.id? req.query.id : req.user.userId;
    const user = await User
      .findOne({ _id: id })
      .select("-password -updatedAt -otp -isAdmin");
    if (!user) return res.status(400).json({ message: "user Not Found!" });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Update user profile
exports.updateuserProfile = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({ message: "Forbidden!" });
    }
    delete req.body.isAdmin;
    delete req.body.otp;
    const id = req.user.isAdmin ? req.params.id : req.user.userId;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "user not found!" });

    let image = user.avatar;
    if (req.body.image !== image && image) {
      const deleteCurrentImage = await deleteFile(image, "cover");
      if (!deleteCurrentImage)
        return res
          .status(400)
          .json({ message: "Only jpeg, jpg or png file allowed" });
    }

    const updateduser = await User.findByIdAndUpdate(user._id, req.body, {
      new: true,
    });
    if (!updateduser) return res.status(400).json("No user found");

    res.status(200).json(updateduser);
  } catch (err) {
    if (err.code === 11000) {
      const fieldName = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        message: `user with ${fieldName}: ${req.body.email} already exists!`,
      });
    }
    if (err.name === "ValidationError") {
      const customMessage = Object.values(err.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ error: customMessage[0] });
    }
    res.status(500).send("Something Went Wrong");
  }
};

//suspend/unsuspend user from listing assets
exports.suspensionToggler = async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Unathorized access!" });
    const user = await User.findById(req.params.id).select("isSuspended");
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.status(200).json({ suspended:user.isSuspended });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.userId === req.params.id || req.user.isAdmin) {
      const id = req.user.isAdmin ? req.params.id : req.user.userId;
      //delete user wallet
      const wallet = await Wallet.findOneAndDelete({ owner: id });
      // if (!wallet) return res.status(404).json({ message: "Wallet not found" });

      const Removeduser = await User.findByIdAndDelete(id);
      const deleteUserAssets = await Asset.find({ seller: id });
      //delete user assets
      await Promise.all(
        deleteUserAssets.map(async (asset) => {
          // Delete image from Mega
          if (asset.image) {
            const deleteImage = await deleteFile(asset.image, "asset");
            if (!deleteImage) throw new Error("Failed to delete asset image");
          }
          await Asset.findByIdAndDelete(asset._id);
        })
      );

      if (!Removeduser)
        return res.status(400).json({ message: "user Not Found!" });

      return res.status(200).json({ success: true, message: "user Removed!" });
    }

    return res.status(403).json({ message: "Forbidden!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get user stats
exports.getuserStatistics = async (req, res) => {
  try {
    const [all, admin] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isAdmin: true }),
    ]);
    if (all === null || admin === null) {
      return res.status(400).json("Unable to count users");
    }
    // console.log(all, admin)
    // Calculate the number of regular users
    const users = Number(all) - Number(admin);
    return res.json({ all, admin, users });
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};
