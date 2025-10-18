const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, trim: true, lowercase:true },
    icon: String,
    description: {
      type: String,
      default: "No description provided",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Platform", platformSchema);
