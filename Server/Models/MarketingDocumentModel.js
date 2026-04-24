const mongoose = require("mongoose");

const marketingDocumentSchema = new mongoose.Schema(
  {
    financialProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProduct",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    documentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kycdocument",
      required: true,
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: ["marketing", "servicing"],
      default: "marketing",
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileOriginalName: {
      type: String,
      required: true,
    },
    fileMimeType: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    lastUploadedAt: {
      type: Date,
      default: null,
    },
    uploadHistory: [
      {
        fileUrl: { type: String, required: true },
        fileOriginalName: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingDocument", marketingDocumentSchema);
