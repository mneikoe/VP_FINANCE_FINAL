const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  // Personal Details
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true
  },
  gender: { 
    type: String, 
    enum: ["Male", "Female", "Other"], 
    default: "" 
  },
  dob: { 
    type: Date, 
    default: null 
  },
  marriageDate: { 
    type: Date, 
    default: null 
  },
  mobileNo: { 
    type: String, 
    required: [true, "Mobile number is required"],
    trim: true
  },
  emailId: { 
    type: String, 
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  panNo: { 
    type: String, 
    default: "",
    uppercase: true,
    trim: true
  },
  aadharNo: { 
    type: String, 
    default: "",
    trim: true
  },
  presentAddress: { 
    type: String, 
    default: "",
    trim: true
  },
  permanentAddress: { 
    type: String, 
    default: "",
    trim: true
  },
  homeTown: { 
    type: String, 
    default: "",
    trim: true
  },
  familyContactPerson: { 
    type: String, 
    default: "",
    trim: true
  },
  familyContactMobile: { 
    type: String, 
    default: "",
    trim: true
  },
  emergencyContactPerson: { 
    type: String, 
    default: "",
    trim: true
  },
  emergencyContactMobile: { 
    type: String, 
    default: "",
    trim: true
  },

  // Official Details
  designation: { 
    type: String, 
    default: "",
    trim: true
  },
  employeeCode: { 
    type: String, 
    required: [true, "Employee code is required"],
    unique: true,
    uppercase: true,
    trim: true
  },
  officeMobile: { 
    type: String, 
    default: "",
    trim: true
  },
  officeEmail: { 
    type: String, 
    default: "",
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true
  },
  allottedLoginId: { 
    type: String, 
    default: "",
    trim: true
  },
  allocatedWorkArea: { 
    type: String, 
    default: "",
    trim: true
  },
  dateOfJoining: { 
    type: Date, 
    default: null 
  },
  dateOfTermination: { 
    type: Date, 
    default: null 
  },
  salaryOnJoining: { 
    type: String, 
    default: "" 
  },
  expenses: { 
    type: String, 
    default: "" 
  },
  incentives: { 
    type: String, 
    default: "" 
  },
  officeKit: { 
    type: String, 
    default: "" 
  },
  offerLetter: { 
    type: String, 
    default: "" 
  },
  undertaking: { 
    type: String, 
    default: "" 
  },
  trackRecord: { 
    type: String, 
    default: "" 
  },
  drawerKeyName: { 
    type: String, 
    default: "" 
  },
  drawerKeyNumber: { 
    type: String, 
    default: "" 
  },
  officeKey: { 
    type: String, 
    default: "" 
  },
  allotmentDate: { 
    type: Date, 
    default: null 
  },
  
  // Role field
  role: { 
    type: String, 
    enum: ["Telecaller", "Telemarketer", "OE", "HR", "RM", "OA"], 
    required: [true, "Role is required"]
  },

  // Bank Details
  bankName: { 
    type: String, 
    default: "" 
  },
  accountNo: { 
    type: String, 
    default: "" 
  },
  ifscCode: { 
    type: String, 
    default: "" 
  },
  micr: { 
    type: String, 
    default: "" 
  },

  // Alerts
  onFirstJoining: { 
    type: String, 
    default: "" 
  },
  onSixMonthCompletion: { 
    type: String, 
    default: "" 
  },
  onTwelveMonthCompletion: { 
    type: String, 
    default: "" 
  }
}, {
  timestamps: true
});

employeeSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);