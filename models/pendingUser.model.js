const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
});

// TTL index – MongoDB will auto-delete after expiresAt
PendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingUser", PendingUserSchema);
