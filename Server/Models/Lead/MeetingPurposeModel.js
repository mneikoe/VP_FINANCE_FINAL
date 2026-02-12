const mongoose = require("mongoose");

const meetingPurposeSchema = new mongoose.Schema(
  {
    meetingPurposeName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MeetingPurpose", meetingPurposeSchema);
