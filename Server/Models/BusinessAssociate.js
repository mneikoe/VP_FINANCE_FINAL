const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const bankDetailsSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
});

const businessAssociateSchema = new mongoose.Schema({
  associateType: {
    type: String,
    required: true,
    enum: [
      "Sub-Broker",
      "Referral Partner",
      "Corporate Associate",
      "Individual Partner",
    ],
  },
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  anniversaryDate: {
    type: Date,
  },
  address: {
    type: String,
    required: true,
  },
  mobileNumber1: {
    type: String,
    required: true,
  },
  mobileNumber2: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  subbrokerCode: {
    type: String,
    unique: true,
  },
  panNumber: {
    type: String,
    required: true,
    unique: true,
  },
  rmName: {
    type: String,
  },
  dateOfJoining: {
    type: Date,
    required: true,
  },
  dateOfTermination: {
    type: Date,
  },
  loginCredentials: {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  bankDetails: bankDetailsSchema,
  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended", "Terminated"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
businessAssociateSchema.pre("save", async function (next) {
  if (!this.isModified("loginCredentials.password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.loginCredentials.password = await bcrypt.hash(
      this.loginCredentials.password,
      salt
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on update
businessAssociateSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model("BusinessAssociate", businessAssociateSchema);
