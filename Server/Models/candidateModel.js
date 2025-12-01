const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String },
  qualification: { type: String },
  experience: { type: String },
  designation: { type: String },
  referralSource: { type: String },
  salary: { type: String },
  training: { type: String },
  noticePeriod: { type: String },
  status: { type: String, default: "Pending" },
  resumeUrl: { type: String }, // store uploaded resume file link
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Candidate", candidateSchema);
