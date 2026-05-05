const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    // Unique event identifier — e.g. "TASK_ASSIGNED", "TASK_FORWARDED_TO_OE"
    eventKey: {
      type: String,
      required: [true, "Event key is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Human-readable label for Admin UI
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
    },

    // Description of when this event fires
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Who receives the notification
    // "assignedTo" → the employee the action happened to
    // "assignedBy" → the employee who performed the action
    // "custom"     → a specific role/employee
    recipientType: {
      type: String,
      enum: ["assignedTo", "assignedBy", "custom"],
      default: "assignedTo",
    },

    // If recipientType is "custom", specify which role(s) should receive
    targetRoles: [
      {
        type: String,
        enum: ["Telecaller", "Telemarketer", "OE", "HR", "RM", "OA", "Accountant"],
      },
    ],

    // The message template with {{placeholder}} variables
    // e.g. "Namaskar {{name}}, aapko task '{{taskName}}' assign hua hai. Due: {{dueDate}}"
    messageTemplate: {
      type: String,
      required: [true, "Message template is required"],
      trim: true,
    },

    // List of available variable names for this event (for admin reference)
    availableVariables: [
      {
        type: String,
        trim: true,
      },
    ],

    // Toggle on/off
    isActive: {
      type: Boolean,
      default: true,
    },

    // Delivery channel
    channel: {
      type: String,
      enum: ["whatsapp", "sms", "both"],
      default: "whatsapp",
    },
  },
  {
    timestamps: true,
    collection: "notification_templates",
  }
);

module.exports = mongoose.model("NotificationTemplate", notificationTemplateSchema);
