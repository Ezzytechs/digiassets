const Post = require("../models/blogs.model");
const { paginate }=require("../utils/pagination");
const {
  uploadFile,
  getFileStream,
  deleteFile,
} = require("../utils/fileStorage");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const file = req.file;

    if(!file) res.status(400).json({Message:"File is required"})

    let image = "";
    // if (file) {
    //   const { nodeId } = await uploadFile(file, "blog");
    //   image = nodeId;
    // }
    const post = new Post({ ...req.body, image, author:req.user.userId });
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const options = {
      filter: {},
      limit,
      page,
      populate: "author",
    };
    const posts = await paginate(Post, options);
    if (!posts || posts.length === 0)
      return res.status(404).json({ message: "No post found" });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//View Post Image
exports.getPostImage = async (req, res) => {
  try {
    const { nodeId } = req.params;
    if (!nodeId) {
      return res.status(400).json({ error: "Image id is required!" });
    }
    const fileStream = await getFileStream(nodeId, "blog");

    // Set appropriate headers for media files
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const file = req.file;
    let newImage = null;
    if (file) {
      const blogPost = await Post.findById(req.params.id).select("image");
      if (!blogPost)
        return res
          .status(404)
          .json({ message: "unable to update this blog post" });
      const deleteOldFile = await deleteFile(blogPost.image, "blog");
      if (!deleteOldFile)
        return res
          .status(400)
          .json({ message: "unable to update this blog post" });
      const { nodeId } = await uploadFile(file, "blog");
      newImage = nodeId;
    }
    newImage = newImage ? { image: newImage } : {};
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date(), ...newImage },
      { new: true, runValidators: true }
    );
  
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    // await deleteFile(deletedPost.image, "blog");
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
