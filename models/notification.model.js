const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      default: "PURCHASED_ASSET",
      enum: ["PURCHASED_ASSET", "SUBMIT_CREDENTIALS", "COMFIRM_SUBMISSION", "VIEWED"],
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:false,
    },
    status: { type: String, enum: ["new", "seen"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema);
