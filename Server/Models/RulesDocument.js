// models/RulesDocument.js
const mongoose = require("mongoose");

const rulesDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    fileType: {
      type: String,
      default: "application/pdf",
    },
    category: {
      type: String,
      enum: [
        "General Rules",
        "HR Policies",
        "Company Policies",
        "Code of Conduct",
        "Compliance",
        "IT Policies",
        "Finance Policies",
        "Administration",
        "Other",
      ],
      default: "General Rules",
    },
    version: {
      type: String,
      default: "1.0",
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: String,
      required: [true, "Uploader name is required"],
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted file size
rulesDocumentSchema.virtual("formattedSize").get(function () {
  if (this.fileSize < 1024) {
    return `${this.fileSize} bytes`;
  } else if (this.fileSize < 1024 * 1024) {
    return `${(this.fileSize / 1024).toFixed(2)} KB`;
  } else {
    return `${(this.fileSize / (1024 * 1024)).toFixed(2)} MB`;
  }
});

// Indexes for better query performance
rulesDocumentSchema.index({ title: "text", description: "text" });
rulesDocumentSchema.index({ category: 1 });
rulesDocumentSchema.index({ isActive: 1 });
rulesDocumentSchema.index({ createdAt: -1 });

const RulesDocument = mongoose.model("RulesDocument", rulesDocumentSchema);

module.exports = RulesDocument;
