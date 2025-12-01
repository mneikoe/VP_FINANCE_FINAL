const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema(
  {
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    publishPlatform: [
      {
        type: String,
        required: true,
      },
    ],
    document: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Closed", "On Hold", "Draft"],
      default: "Active",
    },
    closingDate: {
      type: Date,
    },
    totalApplications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for document URL
vacancySchema.virtual("documentUrl").get(function () {
  if (this.document) {
    return `/api/vacancynotice/documents/${this.document}`;
  }
  return null;
});

module.exports = mongoose.model("Vacancy", vacancySchema);
