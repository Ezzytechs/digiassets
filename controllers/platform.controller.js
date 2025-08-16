const Platform = require("../models/platform.model");
const {
  uploadFile,
  getFileStream,
  deleteFile,
} = require("../utils/fileStorage");

// Create a new platform
exports.createPlatform = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Must include image file" });
    }
    // const { nodeId } = await uploadFile(file, "platform");
    const platform = new Platform(req.body);
    const savedplatform = await platform.save();
    if (!savedplatform)
      return res
        .status(400)
        .json({ message: "Unable to create new platform." });
    res.status(201).json(savedplatform);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//View Asset Image
exports.getPlatformImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Filename is required" });
    }
    const fileStream = await getFileStream(id, "platform");
    // Set appropriate headers for media files
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Get all Platforms
exports.getAllPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ createdAt: -1 });
    if (!platforms)
      return res.status(400).json({ message: "Unable to get all platforms." });
    res.status(200).json(platforms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single platform by ID
exports.getplatformById = async (req, res) => {
  try {
    const platform = await Platform.findById(req.params.id);
    if (!platform)
      return res.status(404).json({ message: "platform not found" });
    res.status(200).json(platform);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a platform
exports.updateplatform = async (req, res) => {
  try {
    const updatedplatform = await Platform.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updatedplatform)
      return res.status(404).json({ message: "platform not found" });
    res.status(200).json(updatedplatform);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a platform
exports.deleteplatform = async (req, res) => {
  try {
    const deletedplatform = await Platform.findByIdAndDelete(req.params.id);

    await deleteFile(deletedAsset.image, "platform");
    if (!deletedAsset)
      return res
        .status(404)
        .json({ message: "Asset not found or unable to delete platform" });

    if (!deletedplatform)
      return res.status(404).json({ message: "platform not found" });
    res.status(200).json({ message: "platform deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
