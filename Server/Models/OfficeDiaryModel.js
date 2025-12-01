const mongoose = require("mongoose");

const officeDiarySchema = new mongoose.Schema({
  orgName: {
    type: String,
    required: true,
  },
  servicePerson: {
    type: String,
    default: "",
  },
  contactNo: {
    type: String,
    default: "",
  },
  licanceNo: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  purchageDate: {
    type: Date,
  },
  amount: {
    type: Number,
    default: 0,
  },
  userId: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  particulars: {
    type: String,
    default: "",
  },
  pdfPath: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("OfficeDiary", officeDiarySchema);
