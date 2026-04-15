const mongoose = require("mongoose");

const crmActivitySchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      enum: ["advertisement", "creativity", "relationship"],
      required: true,
      index: true,
    },
    srNo: { type: Number, default: 0 },
    employeeType: { type: String, default: "" },
    financialProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProduct",
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    financialProduct: { type: String, default: "" },
    companyName: { type: String, default: "" },
    activityName: { type: String, default: "" },
    modeOfActivities: { type: String, default: "" },
    modeOfWish: { type: String, default: "" },
    contentName: { type: String, default: "" },
    preparedBy: { type: String, default: "" },
    publishPlatform: { type: String, default: "" },
    totalExpenses: { type: Number, default: null },
    dateOfPublicity: { type: Date, default: null },
    placeWhereActivityDone: { type: String, default: "" },
    dateOfActivity: { type: Date, default: null },
    requiredMaterial: { type: String, default: "" },
    remark: { type: String, default: "" },
    activityDetails: { type: String, default: "" },
    upwardDownwardCopy: { type: String, default: "" },
    attachmentPath: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CRMActivity", crmActivitySchema);
