// models/IndividualTaskModel.js
import mongoose from "mongoose";

const IndividualTaskSchema = new mongoose.Schema(
  {
    cat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProduct",
      required: true,
    },
    sub: {
      type: String,
      required: true,
      trim: true,
    },
    depart: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedDays: {
      type: Number,
      default: 1,
      min: 1,
      max: 365,
    },
    descp: {
      text: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    type: {
      type: String,
      enum: ["composite", "marketing", "service", "individual"],
      default: "composite",
    },
    email_descp: { type: String, default: "" },
    sms_descp: { type: String, default: "" },
    whatsapp_descp: { type: String, default: "" },
    checklists: {
      type: [String],
      default: [],
    },
    formChecklists: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        downloadFormUrl: { type: String, default: "" },
        sampleFormUrl: { type: String, default: "" },
      },
    ],
    status: {
      type: String,
      enum: ["assigned", "in-progress", "completed", "cancelled", "overdue"],
      default: "assigned",
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompositeTask",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    assignmentDetails: {
      priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
      },
      remarks: String,
      dueDate: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
    completedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
    collection: "individual_tasks",
  }
);

const IndividualTask =
  mongoose.models.IndividualTask ||
  mongoose.model("IndividualTask", IndividualTaskSchema);

export default IndividualTask;
