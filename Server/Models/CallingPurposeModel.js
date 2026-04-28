const mongoose = require("mongoose");

const CallingPurposeSchema = new mongoose.Schema(
  {
    purposeName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CallingPurpose", CallingPurposeSchema);
