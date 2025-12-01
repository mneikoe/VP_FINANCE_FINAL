
const mongoose = require("mongoose");

const LeadTypeSchema = new mongoose.Schema(
  {
    leadType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  }
);

module.exports = mongoose.model("LeadType", LeadTypeSchema);