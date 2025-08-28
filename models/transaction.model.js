const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  tnxReference: {
    type: String,
    required: true,
    unique: true,
  },
  gatewayRef:String,
  
  tnxDescription:{
    type: String,
    required: true,
    index:true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index:true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  nonRegUser: {
    email: String,
    phone: String,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
