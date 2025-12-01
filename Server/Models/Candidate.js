// models/Candidate.js - UPDATED
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    // Personal Details
    candidateName: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },

    // Professional Details
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    education: {
      type: String,
      default: "",
      trim: true,
    },
    ageGroup: {
      type: String,
      default: "",
      trim: true,
    },
    vehicle: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    nativePlace: {
      type: String,
      default: "",
      trim: true,
    },
    spokenEnglish: {
      type: Boolean,
      default: false,
    },
    salaryExpectation: {
      type: String,
      default: "",
      trim: true,
    },

    // Experience Fields
    experienceFields: {
      administrative: { type: Number, default: 0, min: 0, max: 5 },
      insuranceSales: { type: Number, default: 0, min: 0, max: 5 },
      anySales: { type: Number, default: 0, min: 0, max: 5 },
      fieldWork: { type: Number, default: 0, min: 0, max: 5 },
    },

    // Operational Activities
    operationalActivities: {
      dataManagement: { type: Number, default: 0, min: 0, max: 5 },
      backOffice: { type: Number, default: 0, min: 0, max: 5 },
      mis: { type: Number, default: 0, min: 0, max: 5 },
    },

    // Grading System (Existing)
    totalMarks: {
      type: Number,
      default: 0,
    },
    shortlisted: {
      type: Boolean,
      default: false,
    },

    // Status Tracking
    currentStage: {
      type: String,
      enum: [
        "Career Enquiry",
        "Resume Shortlisted",
        "Interview Process",
        "Selected",
        "Joining Data",
        "Joining Letter Sent",
        "Offer Letter Sent",
        "Added as Employee",
        "Rejected",
      ],
      default: "Career Enquiry",
    },
    currentStatus: {
      type: String,
      enum: [
        "Career Enquiry",
        "Resume Shortlisted",
        "Interview Process",
        "Joining Data",
        "Joining Letter Sent",
        "Offer Letter Sent",
        "Added as Employee",
        "Rejected",
      ],
      default: "Career Enquiry",
    },

    // Interview Details
    interviewDate: {
      type: Date,
      default: null,
    },

    // Application Details
    appliedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vacancy",
      required: [true, "Applied for vacancy is required"],
    },
    resume: {
      type: String,
      default: "",
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // ✅ Better error handling
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate marks before saving (Same as frontend logic)
candidateSchema.pre("save", function (next) {
  this.totalMarks = calculateMarks(this);
  this.shortlisted = this.totalMarks >= 20;
  next();
});

// Same calculation logic as frontend
function calculateMarks(candidate) {
  let marks = 0;

  // Education marks
  switch (candidate.education) {
    case "Graduate in any":
      marks += 2;
      break;
    case "Graduate in Maths/Economics":
      marks += 3;
      break;
    case "MBA/PG with financial subject":
      marks += 4;
      break;
  }

  // Age group marks
  switch (candidate.ageGroup) {
    case "20-25yr":
      marks += 1;
      break;
    case "26-30yr":
      marks += 2;
      break;
    case "31-45yr":
      marks += 3;
      break;
    case "45 & above":
      marks += 2;
      break;
  }

  // Vehicle marks
  if (candidate.vehicle) marks += 4;

  // Experience fields marks
  marks += candidate.experienceFields?.administrative || 0;
  marks += candidate.experienceFields?.insuranceSales || 0;
  marks += candidate.experienceFields?.anySales || 0;
  marks += candidate.experienceFields?.fieldWork || 0;

  // Operational activities marks
  marks += candidate.operationalActivities?.dataManagement || 0;
  marks += candidate.operationalActivities?.backOffice || 0;
  marks += candidate.operationalActivities?.mis || 0;

  // Location marks
  const locationMarks = {
    "H.B Road": 4,
    "Arera Colony": 3,
    BHEL: 2,
    Mandideep: 2,
    Others: 1,
  };
  marks += locationMarks[candidate.location] || 0;

  // Native place marks
  if (candidate.nativePlace === "Bhopal") marks += 3;
  else marks += 1;

  // Spoken English marks
  if (candidate.spokenEnglish) marks += 4;

  // Salary expectation marks
  const salaryMarks = {
    "10K-12K": 4,
    "12-15K": 3,
    "15-18K": 3,
    "18-20K": 2,
    "20-25K": 2,
    "25K & Above": 1,
  };
  marks += salaryMarks[candidate.salaryExpectation] || 0;

  return marks;
}

module.exports = mongoose.model("Candidate", candidateSchema);
