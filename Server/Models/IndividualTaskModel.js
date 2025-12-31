// models/IndividualTaskModel.js - UPDATE KARO
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

    // ✅ YEH NAYA FIELD ADD KARO
    clientProspectStatuses: [
      {
        entityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "testSchema",
          required: true,
        },
        entityType: {
          type: String,
          enum: ["client", "prospect"],
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed", "cancelled"],
          default: "pending",
        },
        remarks: {
          type: String,
          default: "",
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        files: [
          {
            filename: String,
            originalName: String,
            uploadedAt: Date,
          },
        ],
      },
    ],

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
      assignedClients: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "testSchema",
        },
      ],
      assignedProspects: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "testSchema",
        },
      ],
      clientAssignmentRemarks: String,
      prospectAssignmentRemarks: String,
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
