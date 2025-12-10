const mongoose = require("mongoose");

const RMAssignmentSchema = new mongoose.Schema(
  {
    prospectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "testSchema",
      required: true,
    },
    rmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    rmName: {
      type: String,
      required: true,
    },
    rmCode: {
      type: String,
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    assignmentNotes: String,
    status: {
      type: String,
      enum: ["assigned", "completed", "cancelled"],
      default: "assigned",
    },
    completedAt: Date,
    completedNotes: String,
  },
  {
    timestamps: true,
  }
);

// Ensure one RM per prospect
RMAssignmentSchema.index({ prospectId: 1 }, { unique: true });

module.exports = mongoose.model("RMAssignment", RMAssignmentSchema);
