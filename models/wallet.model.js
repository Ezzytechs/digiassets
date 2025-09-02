const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: [true, "Wallet already exit for this user"],
    },
    accountDetails: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      sortCode:{type:Number, default:0},
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
