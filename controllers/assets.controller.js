const mongoose = require("mongoose");
const Asset = require("../models/assets.model");
const { paginate } = require("../utils/pagination");
const {
  uploadFile,
  getFileStream,
  deleteFile,
} = require("../utils/fileStorage");
const Category = require("../models/category.model");
const Platform = require("../models/platform.model");
const { User } = require("../models/users.model");
const Order = require("../models/orders.model");
const Credential = require("../models/credential.model");
const { encrypt } = require("../utils/encryption");

// list asset
exports.listAsset = async (req, res) => {
  try {
    // check if user is banned from listing asset
    const id = req.user.userId;
    const user = await User.findById(id).select("isSuspended");
    if (user?.isSuspended) {
      return res.status(403).json({ message: "Your account is suspended!" });
    }

    // file validation
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Must include image file" });
    }

    // validate category
    const platform = await Category.findById(req.body.category);
    if (!platform) {
      return res.status(404).json({
        message: "Unable to find the associated platform for the category",
      });
    }

    // upload image
    const { nodeId } = await uploadFile(file.buffer, file.originalname, "asset");

    // create new asset
    const newAsset = new Asset({
      ...req.body,
      platform: platform.platform,
      seller: req.user.userId,
      image: nodeId,
    });
    const savedAsset = await newAsset.save();

    // handle credentials if provided
    const { username = null, password = null, notes = null } = req.body.credentials || {};
    if (username && password) {
      const encryptedData = {
        username: encrypt(username),
        password: encrypt(password),
        notes: encrypt(notes || ""),
        encrypted: true,
      };

      const credentials = new Credential({
        credentials: { ...encryptedData },
        orderId: savedAsset._id,
      });
      const savedCredentials = await credentials.save();

      if (!savedCredentials) {
        return res.status(404).json({
          message: "Unable to create featured asset, Please try again",
        });
      }
      // ✅ update asset to featured after credentials saved
      savedAsset.status = "featured";
      await savedAsset.save();
    }

    res.status(201).json(savedAsset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all assets [pass query to filter for user, sold status...]
exports.getAllAssets = async (req, res) => {
  try {
    let { limit = 20, page = 1, ...query } = req.query || {};
    const options = {
      filter: { ...query },
      limit,
      page,
      populate: "seller platform category",
      populateSelect: "username email phone name icon",
      select: "-description",
    };
    const assets = await paginate(Asset, options);
    if (!assets || assets.length === 0)
      return res.status(404).json({ message: "No available assets found" });
    res.status(200).json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get assets by category name
exports.getAssetsByCategoryName = async (req, res) => {
  try {
    const { category, platform } = req.params;
    let searchQuery = {};
    if (!platform)
      return res.status(400).json({ message: "Category name is required!" });

    const platformId = await Platform.findOne({ name: platform });
    if (!platformId)
      return res.status(404).json({ message: "Platform not found" });
    searchQuery = { platform: platformId._id };

    if (category !== "assets") {
      const categoryId = await Category.findOne({
        name: category,
        platform: platformId._id,
      });
      if (!categoryId)
        return res.status(404).json({ message: "Category not found" });
      searchQuery = { ...searchQuery, category: categoryId._id };
    }

    const { page = 1, limit = 20, ...query } = req.query;

    const options = {
      filter: { ...query, ...searchQuery },
      populate: "seller category platform",
      populateSelect: "username email phone name",
      page,
      limit,
      select: "-description",
    };
    const assets = await paginate(Asset, options);
    if (!assets || assets.length === 0)
      return res.status(404).json({ message: "No available assets found" });
    res.status(200).json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user assets by username
exports.getUserAssets = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username)
      return res
        .status(400)
        .json({ message: "Incorrect or no params provided" });

    const user = await User.findOne({ username }).select("_id");
    if (!user)
      return res
        .status(400)
        .json({ message: "User with provided username does not exist!" });
    const sellerId = { seller: user._id };
    const { limit = 20, page = 1, ...query } = req.query;

    const options = {
      filter: { ...query, ...sellerId },
      page,
      limit,
      populate: "category platform",
      populateSelect: "phone name icon",
    };
    const assets = await paginate(Asset, options);
    if (!assets || assets.length === 0)
      return res.status(404).json({ message: "No available assets found" });
    res.status(200).json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate([
      { path: "seller", select: "email phone username" },
      { path: "category" },
      { path: "platform" },
    ]);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.status(200).json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//View Asset Image
exports.getAssetImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Filename is required" });
    }
    const fileStream = await getFileStream(id, "asset");
    // Set appropriate headers for media files
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  try {
    const file = req.file;
    let newImage = null;
    if (file) {
      const asset = await Asset.findById(req.params.id).select("image");
      if (!asset)
        return res
          .status(400)
          .json({ message: "unable to update this product" });

      const deleteOldFile = await deleteFile(asset.image);
      if (!deleteOldFile)
        return res
          .status(400)
          .json({ message: "unable to update this product" });
      const { nodeId } = await uploadFile(file.buffer, file.originalname, "asset");
      newImage = nodeId;
    }
    newImage = newImage ? { image: newImage } : {};
    let updatedAsset = null;
    if (req.user.isAdmin) {
      updatedAsset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
    } else {
      updatedAsset = await Asset.findOneAndUpdate(
        { _id: req.params.id, seller: req.user.userId },
        { ...req.body, seller: req.user.userId, ...newImage },
        { new: true, runValidators: true }
      );
    }
    if (!updatedAsset)
      return res.status(404).json({ message: "Asset not found" });
    res.status(200).json(updatedAsset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  try {
    const assetId = req.params.id;
    let deletedAsset = null;

    const assetOrder = await Order.findOne({ asset: assetId });
    if (assetOrder)
      return res.status(400).json({ message: "This asset has been ordered!" });

    if (req.user.isAdmin) {
      deletedAsset = await Asset.findByIdAndDelete(req.params.id);
    } else {
      deletedAsset = await Asset.findOneAndDelete({
        _id: req.params.id,
        seller: req.user.userId,
      });
    }
    await deleteFile(deletedAsset.image, "asset");
    if (!deletedAsset)
      return res
        .status(404)
        .json({ message: "Asset not found or unable to delete asset" });
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filter assets by platform or category
exports.filterAssets = async (req, res) => {
  try {
    let query = {};
    if (req.query.platform) query.platform = req.query.platform;
    if (req.query.category) query.category = req.query.category;

    const limit = req.query.limit || 20;
    const page = req.query.page || 1;

    const options = {
      filter: { query },
      populate: "seller",
      limit,
      page,
      select: "-description",
    };
    const assets = await paginate(Asset, options);
    if (!assets || assets.length === 0)
      return res.status(404).json({ message: "No available assets found" });
    res.status(200).json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get stats and revenue of assets
exports.getAssetsStats = async (req, res) => {
  try {
    const query = req.query || {};
    let filterQuery = req.user.isAdmin
      ? { ...query }
      : { ...query, seller: new mongoose.Types.ObjectId(req.user.userId) };

    if (filterQuery.seller) {
      filterQuery.seller = new mongoose.Types.ObjectId(filterQuery.seller);
    }

    const count = await Asset.countDocuments({ ...filterQuery });

    const totalRevenue = await Asset.aggregate([
      { $match: { ...filterQuery } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    res.status(200).json({
      totalAssets: count,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get stats and revenue of assets
exports.assetsStats = async (req, res) => {
  try {
    const [all, available, featured, sold,] = await Promise.all([
      await Asset.countDocuments({}),
      await Asset.countDocuments({ status: "available" }),
      await Asset.countDocuments({ status: "featured" }),
      await Asset.countDocuments({ status: "sold" }),
    ]);
    if (typeof sold !== "number" ||
  typeof available !== "number" ||
  typeof all !== "number" ||
  typeof featured !== "number")
      return res.status(400).json({ message: "Unable to load statistics" });
    res.status(200).json({ all, available, sold, featured });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
