const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, lowercase:true },
    platform:{ type:mongoose.Schema.Types.ObjectId, ref:"Platform"},
    icon: String,
    deductionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      default: "No description provided",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
