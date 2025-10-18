const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index:true,
    },
    platform: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Platform",
      index:true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Category",
      index:true,
    },
    url: {
      type: String,
      required: [true, "Url of the asset is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index:true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum:["sold", "available", "featured"],
      default:"available"
    },
    image: String,
    metadata: {
      followers: Number,
      niche: String,
      accountAge: Number,
      engagementRate: Number,
      extraDetails: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
