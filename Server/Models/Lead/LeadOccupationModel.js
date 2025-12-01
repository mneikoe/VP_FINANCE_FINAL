
// LeadOccupation Model  
const mongoose = require("mongoose");

const leadOccupationSchema = new mongoose.Schema(
  {
    occupationName: {
      type: String,
      required: true,
    },
    occupationType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OccupationType",
      required: true,
    },
  },
  { timestamps: true }
);

const LeadOccupation = mongoose.model("LeadOccupation", leadOccupationSchema);
module.exports = LeadOccupation;


