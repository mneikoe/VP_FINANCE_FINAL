const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    financialProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProduct",
      required: true,
    },
    companyName: { type: String },
    localOfficeAddress: { type: String },
    contactNo: { type: String },
    emailId: { type: String },
    branchManagerMobile: { type: String },
    headOfficeAddress: { type: String },
    headOfficeContact: { type: String },
    headOfficeEmail: { type: String },
    website: { type: String },
    relationshipManagerName: { type: String },
    relationshipManagerDOB: { type: Date },
    relationshipManagerMobile: { type: String },
    relationshipManagerEmail: { type: String },
    agencyCode: { type: String },
    portalLink: { type: String },
    alternatePortalLink: { type: String },

    loginCredentials: [
      {
        loginName: { type: String },
        username: { type: String },
        password: { type: String },
      },
    ],

    appDetails: [
      {
        appName: { type: String },
        appUsername: { type: String },
        appPassword: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", CompanySchema);
