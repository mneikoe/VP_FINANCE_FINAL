const mongoose = require("mongoose");

const HRSchema = new mongoose.Schema({
  // Basic auth fields
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileno: { type: String, required: true, unique: true },
  role: { type: String, default: "HR" },
  
  // Employee reference
  employeeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  },
  
  // ✅ COMPLETE EMPLOYEE DATA (same as employee model)
  employeeCode: { type: String, trim: true, uppercase: true },
  designation: { type: String, trim: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "" },
  dob: { type: Date, default: null },
  marriageDate: { type: Date, default: null },
  
  // Address details
  presentAddress: { type: String, default: "", trim: true },
  permanentAddress: { type: String, default: "", trim: true },
  homeTown: { type: String, default: "", trim: true },
  
  // Contact details
  familyContactPerson: { type: String, default: "", trim: true },
  familyContactMobile: { type: String, default: "", trim: true },
  emergencyContactPerson: { type: String, default: "", trim: true },
  emergencyContactMobile: { type: String, default: "", trim: true },
  
  // Office details
  officeMobile: { type: String, default: "", trim: true },
  officeEmail: { type: String, default: "", lowercase: true, trim: true },
  allottedLoginId: { type: String, default: "", trim: true },
  allocatedWorkArea: { type: String, default: "", trim: true },
  dateOfJoining: { type: Date, default: null },
  dateOfTermination: { type: Date, default: null },
  
  // Financial details
  salaryOnJoining: { type: String, default: "" },
  expenses: { type: String, default: "" },
  incentives: { type: String, default: "" },
  
  // Bank details
  bankName: { type: String, default: "" },
  accountNo: { type: String, default: "" },
  ifscCode: { type: String, default: "" },
  micr: { type: String, default: "" },
  
  // Documents and assets
  officeKit: { type: String, default: "" },
  offerLetter: { type: String, default: "" },
  undertaking: { type: String, default: "" },
  trackRecord: { type: String, default: "" },
  drawerKeyName: { type: String, default: "" },
  drawerKeyNumber: { type: String, default: "" },
  officeKey: { type: String, default: "" },
  
  // Alerts
  onFirstJoining: { type: String, default: "" },
  onSixMonthCompletion: { type: String, default: "" },
  onTwelveMonthCompletion: { type: String, default: "" },
  
  // Identification
  panNo: { type: String, default: "" },
  aadharNo: { type: String, default: "" },
  
  // ✅ HR SPECIFIC FIELDS (optional - aage add kar sakte ho)
  hrResponsibilities: [{
    responsibility: String,
    assignedDate: { type: Date, default: Date.now }
  }],
  
  managedEmployees: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    assignedDate: Date
  }],
  
  recruitmentStats: {
    totalHired: { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  }
  
}, { timestamps: true });

const HR = mongoose.model("HR", HRSchema);
module.exports = HR;