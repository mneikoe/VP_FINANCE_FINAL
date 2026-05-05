const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    // Which event triggered this notification
    eventKey: {
      type: String,
      required: true,
      trim: true,
    },

    // Recipient details
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    recipientName: {
      type: String,
      default: "",
      trim: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    // Actual message that was sent (after variable replacement)
    messageContent: {
      type: String,
      required: true,
    },

    // Delivery channel used
    channel: {
      type: String,
      enum: ["whatsapp", "sms"],
      default: "whatsapp",
    },

    // Delivery status
    status: {
      type: String,
      enum: ["sent", "failed", "queued"],
      default: "queued",
    },

    // Error message if delivery failed
    errorMessage: {
      type: String,
      default: "",
    },

    // Twilio Message SID for tracking
    twilioSid: {
      type: String,
      default: "",
    },

    // Any extra metadata (task name, IDs, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "notification_logs",
  }
);

// Index for efficient querying
notificationLogSchema.index({ eventKey: 1, createdAt: -1 });
notificationLogSchema.index({ recipientId: 1, createdAt: -1 });
notificationLogSchema.index({ status: 1 });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
