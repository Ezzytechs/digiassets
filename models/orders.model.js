const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: "non-user",
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: true,
      index: true,
    },
    nonRegUser: {
      email: String,
      phone: String,
    },
    price: { type: Number, default: 0 },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    payRef: String,
    status: {
      type: String,
      enum: ["paid", "credentials_submitted", "cancelled", "completed"],
      default: "paid",
    },
    credentialsSubmittedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
