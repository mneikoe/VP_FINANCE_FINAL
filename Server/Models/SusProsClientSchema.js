const mongoose = require("mongoose");

// Reuse sub-documents
const healthHistorySchema = new mongoose.Schema({
  submissionDate: Date,
  diseaseName: String,
  since: Date,
  height: String,
  weight: String,
  remark: String,
});

const familyMemberSchema = new mongoose.Schema({
  title: String,
  name: String,
  relation: String,
  annualIncome: String,
  occupation: String,
  dobActual: Date,
  dobRecord: Date,
  marriageDate: Date,
  includeHealth: Boolean,
  contact: String,
  healthHistory: [healthHistorySchema],
});

const customerDocSchema = new mongoose.Schema({
  createdDate: Date,
  memberName: String,
  documentNo: String,
  documentName: String,
  financialProducts: String,
  remark: String,
  upload: [String],
});

const financialInfoSchema = new mongoose.Schema({
  insurance: [
    {
      submissionDate: { type: Date, required: true },
      memberName: { type: String, required: true },
      insuranceCompany: { type: String, required: true },
      policyNumber: { type: String, required: true },
      planName: { type: String, required: true },
      sumAssured: { type: Number, required: true },
      mode: { type: String, required: true },
      premium: { type: Number, required: true },
      startDate: { type: Date, required: true },
      maturityDate: { type: Date, required: true },
      document: { type: String, default: null },
    },
  ],
  investments: [
    {
      submissionDate: { type: Date, required: true },
      memberName: { type: String, required: true },
      financialProduct: { type: String, required: true },
      companyName: { type: String, required: true },
      planName: { type: String, required: true },
      amount: { type: Number, required: true },
      startDate: { type: Date, required: true },
      maturityDate: { type: Date, required: true },
      document: { type: String, default: null },
    },
  ],
  loans: [
    {
      submissionDate: { type: Date, required: true },
      memberName: { type: String, required: true },
      loanType: { type: String, required: true },
      companyName: { type: String, required: true },
      loanAccountNumber: { type: String, required: true },
      outstandingAmount: { type: Number, required: true },
      interestRate: { type: Number, required: true },
      term: { type: String, required: true },
      startDate: { type: Date, required: true },
      maturityDate: { type: Date, required: true },
    },
  ],
});

const needsSchema = new mongoose.Schema({
  financialProducts: String,
  anyCorrection: String,
  anyUpdation: String,
  financialCalculation: Boolean,
  assesmentOfNeed: Boolean,
  portfolioManagement: Boolean,
  doorStepServices: Boolean,
  purchaseNewProducts: Boolean,
});

const proposedPlanSchema = new mongoose.Schema({
  createdDate: { type: Date },
  memberName: { type: String, required: true },
  financialProduct: { type: String, required: true },
  financialCompany: { type: String, required: true },
  planName: { type: String, required: true },
  documents: { type: [String] },
  status: { type: String },
});

const personalDetailsSchema = new mongoose.Schema({
  groupCode: String,
  groupName: String,
  gender: String,
  salutation: String,
  mobileNo: String,
  emailId: String,
  name: String,

  organisation: String,
  designation: String,
  annualIncome: String,
  grade: String,
  familyHead: String,
  contactNo: String,
  whatsappNo: String,
  paName: String,
  paMobileNo: Number,
  adharNumber: String,
  panCardNumber: String,
  preferredAddressType: { type: String, enum: ["resi", "office"] },
  resiAddr: String,
  resiLandmark: String,
  resiPincode: String,
  officeAddr: String,
  officeLandmark: String,
  officePincode: String,
  preferredMeetingAddr: String,
  preferredMeetingArea: String,
  city: String,
  bestTime: String,
  nativePlace: String,
  hobbies: String,
  socialLink: String,
  habits: String,
  leadSource: String,
  leadName: String,
  leadPerson: String,
  leadOccupation: String,
  leadOccupationType: String,
  occupation: String,
  callingPurpose: String,
  allocatedCRE: String,
  remark: String,
  pincode: Number,
  dob: Date,
  dom: Date,
  profilepic: String,
});

// Models/SusProsClientSchema.js में callTaskSchema update करो
const callTaskSchema = new mongoose.Schema(
  {
    taskDate: {
      type: Date,
      required: true,
    },
    taskTime: {
      type: String,
      required: true,
    },
    taskRemarks: String,
    taskStatus: {
      type: String,
      enum: [
        // ✅ FORWARDED STATUSES
        "Call Not Picked",
        "Busy on Another Call",
        "Call After Sometimes",
        "Others",

        // ✅ CLOSED STATUSES
        "Not Reachable",
        "Wrong Number",
        "Not Interested",
        "Appointment Done",

        // ✅ ACTIVE STATUSES
        "Callback",
        "Not Contacted",
      ],
      required: true,
    },
    // ✅ NEW: Category field for easy filtering
    taskCategory: {
      type: String,
      enum: ["forwarded", "closed", "active"],
      default: "active",
    },
    // ✅ NEW: Next follow-up date for forwarded calls
    nextFollowUpDate: Date,
    nextFollowUpTime: String,
    nextAppointmentDate: {
      type: Date,
      default: null,
    },
    nextAppointmentTime: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const callHistorySchema = new mongoose.Schema({
  callDate: Date,
  duration: String,
  remarks: String,
  mobile: String, // Assuming you need a mobile number field
  status: String, // Add if status is also tracked in history
  callBy: String, // Capture who made the call
});

const TestShema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["suspect", "prospect", "client"],
  },
  personalDetails: personalDetailsSchema,
  education: {
    types: {
      type: String,
      enum: ["", "school", "college", "professional"],
    },
    schoolName: String,
    schoolSubjects: String,
    collegeName: String,
    collegeCourse: String,
    instituteName: String,
    professionalDegree: String,
  },

  preferences: {},
  familyMembers: [familyMemberSchema],
  financialInfo: financialInfoSchema,
  futurePriorities: [
    {
      priorityName: { type: String, required: true },
      members: { type: [String], required: true },
      approxAmount: { type: Number, required: true },
      duration: { type: String, required: true },
      remark: { type: String },
    },
  ],
  proposedPlan: [proposedPlanSchema],
  needs: needsSchema,
  customerDoc: [customerDocSchema],
  kycs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kyc",
    },
  ],
  taskDetails: String,
  assignedAt: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Telecaller",
    default: null,
  },
  assignedRole: {
    type: String,
    enum: ["Telecaller", "HR", "Manager"],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  callTasks: [callTaskSchema],
  callHistory: [callHistorySchema],
});

module.exports = mongoose.model("testSchema", TestShema);
