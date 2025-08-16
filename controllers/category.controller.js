const Category = require('../models/category.model');
const {
  uploadFile,
  getFileStream,
  deleteFile,
} = require("../utils/fileStorage");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Must include image file" });
    }
    // const { nodeId } = await uploadFile(file, "category");
    const category = new Category(req.body);
    const savedCategory = await category.save();
    if (!savedCategory)
      return res
        .status(400)
        .json({ message: "Unable to create new category." });
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).populate("platform");
    res.status(200).json(categories)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category).populate("platform");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//View Asset Image
exports.getCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Filename is required" });
    }
    const fileStream = await getFileStream(id, "category");
    // Set appropriate headers for media files
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
       await deleteFile(deletedAsset.image, "category");
        if (!deletedAsset)
          return res
            .status(404)
            .json({ message: "Asset not found or unable to delete platform" });
    
    if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
