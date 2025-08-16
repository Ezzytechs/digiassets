const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  image:String,
  tags: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  thumbnail: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

postSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Post", postSchema);
