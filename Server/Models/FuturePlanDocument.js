// models/FuturePlanDocument.js
const mongoose = require("mongoose");

const futurePlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Plan title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
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
        "Vision & Mission",
        "Business Expansion",
        "Technology Roadmap",
        "Marketing Strategy",
        "Financial Planning",
        "HR Development",
        "Operations",
        "Research & Development",
        "Sustainability",
        "Other",
      ],
      required: [true, "Category is required"],
    },
    strategicArea: {
      type: String,
      enum: [
        "Short Term (1-2 years)",
        "Medium Term (3-5 years)",
        "Long Term (5+ years)",
        "Immediate (0-1 year)",
      ],
      default: "Medium Term (3-5 years)",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    confidentialLevel: {
      type: String,
      enum: ["Public", "Internal", "Confidential", "Restricted"],
      default: "Internal",
    },
    targetYear: {
      type: Number,
      min: 2024,
      max: 2050,
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
    approvedBy: {
      type: String,
    },
    approvedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Under Review"],
      default: "Pending",
    },
    reviewDate: {
      type: Date,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted file size
futurePlanSchema.virtual("formattedSize").get(function () {
  if (this.fileSize < 1024) {
    return `${this.fileSize} bytes`;
  } else if (this.fileSize < 1024 * 1024) {
    return `${(this.fileSize / 1024).toFixed(2)} KB`;
  } else {
    return `${(this.fileSize / (1024 * 1024)).toFixed(2)} MB`;
  }
});

// Virtual for status badge color
futurePlanSchema.virtual("statusColor").get(function () {
  const colors = {
    Pending: "warning",
    Approved: "success",
    Rejected: "danger",
    "Under Review": "info",
  };
  return colors[this.approvalStatus] || "secondary";
});

// Indexes
futurePlanSchema.index({ title: "text", description: "text" });
futurePlanSchema.index({ category: 1 });
futurePlanSchema.index({ strategicArea: 1 });
futurePlanSchema.index({ priority: 1 });
futurePlanSchema.index({ approvalStatus: 1 });
futurePlanSchema.index({ isActive: 1 });
futurePlanSchema.index({ createdAt: -1 });

const FuturePlanDocument = mongoose.model(
  "FuturePlanDocument",
  futurePlanSchema
);

module.exports = FuturePlanDocument;
