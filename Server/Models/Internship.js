const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    // Personal Information (Simplified)
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
      default: "Indian",
    },
    contactNo: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Please enter valid 10-digit contact number",
      },
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    permanentAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // Educational Background
    universityName: {
      type: String,
      required: true,
      trim: true,
    },
    degreeProgram: {
      type: String,
      required: true,
      trim: true,
    },
    yearOfStudy: {
      type: String,
      required: true,
      enum: [
        "First Year",
        "Second Year",
        "Third Year",
        "Fourth Year",
        "Final Year",
        "Post Graduate",
      ],
    },
    expectedGraduationDate: {
      type: Date,
      required: true,
    },
    cumulativeGPA: {
      type: Number,
      min: 0,
      max: 10,
    },

    // Internship Details
    positionApplied: {
      type: String,
      required: true,
      trim: true,
    },
    preferredStartDate: {
      type: Date,
      required: true,
    },
    preferredEndDate: {
      type: Date,
      required: true,
    },
    hoursPerWeek: {
      type: Number,
      required: true,
      min: 10,
      max: 40,
    },

    // Skills
    relevantSkills: {
      type: [String],
      default: [],
    },

    // Uploaded Documents
    resume: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
    },
    otherDocuments: [
      {
        name: String,
        url: String,
      },
    ],

    // Uploaded Certificate (Pre-made PDF)
    certificateFile: {
      type: String,
    },
    certificateFileName: {
      type: String,
    },

    // Application Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Selected",
        "Rejected",
        "Offer Accepted",
        "Offer Declined",
        "Completed",
      ],
      default: "Pending",
    },

    // Internship Management
    assignedSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    department: {
      type: String,
    },
    actualStartDate: {
      type: Date,
    },
    actualEndDate: {
      type: Date,
    },
    stipendAmount: {
      type: Number,
    },

    // System Fields
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminNotes: {
      type: String,
    },
    declarationAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    // HR Fields
    hrRemarks: {
      type: String,
    },
    interviewDate: {
      type: Date,
    },
    interviewNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Internship", internshipSchema);
