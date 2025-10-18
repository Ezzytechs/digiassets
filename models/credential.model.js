const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    viewed: { type: Boolean, default: false, viewedAt: Date },
    credentials: {
      username: { type: String },
      password: { type: String },
      notes: { type: String },
      encrypted: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Credential", credentialSchema);
