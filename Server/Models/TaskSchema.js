// TaskSchema.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["composite", "marketing", "service", "individual"],
      default: "composite",
    },
    estimatedDays: {
      type: Number,
      default: 1,
      min: 1,
      max: 365,
    },
    templatePriority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    descp: {
      text: { type: String, default: "" },
      image: { type: String, default: "" },
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
      enum: ["template", "assigned", "in-progress", "completed", "cancelled"],
      default: "template",
    },
    assignments: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        employeeRole: String,
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high", "urgent"],
          default: "medium",
        },
        remarks: String,
        dueDate: Date,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed", "overdue"],
          default: "pending",
        },
        completedAt: Date,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

export default TaskSchema;
