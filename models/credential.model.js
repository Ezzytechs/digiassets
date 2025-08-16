const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema(
  {
    orderId:{type:mongoose.Schema.Types.ObjectId, ref:"Order"},
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
