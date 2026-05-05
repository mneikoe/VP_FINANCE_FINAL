// utils/notificationService.js — Central Notification Engine
// Usage: notificationService.trigger("TASK_ASSIGNED", { recipientPhone, name, taskName, ... })

import NotificationTemplate from "../Models/NotificationTemplateModel.js";
import NotificationLog from "../Models/NotificationLogModel.js";
import twilio from "twilio";


// ─── Twilio Client (lazy-initialised) ────────────────────────────────────────
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn("⚠️  Twilio credentials not set in .env — notifications will be logged only");
      return null;
    }

    // Use the imported twilio instance
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

// ─── Replace {{placeholders}} in template ────────────────────────────────────
const fillTemplate = (template, data) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : match;
  });
};

// ─── Format phone for Twilio WhatsApp ────────────────────────────────────────
const formatPhone = (phone) => {
  if (!phone) return null;
  // Remove spaces, dashes
  let clean = phone.replace(/[\s\-()]/g, "");
  // Add +91 if only 10 digits (Indian number)
  if (/^\d{10}$/.test(clean)) {
    clean = "+91" + clean;
  }
  // Add + if missing
  if (!clean.startsWith("+")) {
    clean = "+" + clean;
  }
  return clean;
};

// ─── Send WhatsApp via Twilio ────────────────────────────────────────────────
const sendWhatsApp = async (to, body) => {
  const client = getTwilioClient();
  if (!client) return { success: false, error: "Twilio not configured" };

  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  try {
    const message = await client.messages.create({
      from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      to: `whatsapp:${formatPhone(to)}`,
      body: body,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("❌ Twilio WhatsApp error:", error.message);
    return { success: false, error: error.message };
  }
};

// ─── Send SMS via Twilio ─────────────────────────────────────────────────────
const sendSMS = async (to, body) => {
  const client = getTwilioClient();
  if (!client) return { success: false, error: "Twilio not configured" };

  const from = process.env.TWILIO_SMS_FROM || process.env.TWILIO_WHATSAPP_FROM;

  try {
    const message = await client.messages.create({
      from: from,
      to: formatPhone(to),
      body: body,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("❌ Twilio SMS error:", error.message);
    return { success: false, error: error.message };
  }
};

// ─── Log notification to DB ──────────────────────────────────────────────────
const logNotification = async ({ eventKey, recipientPhone, recipientName, recipientId, messageContent, channel, status, errorMessage, twilioSid, metadata }) => {
  try {
    await NotificationLog.create({
      eventKey,
      recipientPhone: recipientPhone || "",
      recipientName: recipientName || "",
      recipientId: recipientId || null,
      messageContent,
      channel,
      status,
      errorMessage: errorMessage || "",
      twilioSid: twilioSid || "",
      metadata: metadata || {},
    });
  } catch (err) {
    console.error("❌ Failed to log notification:", err.message);
  }
};

// ─── MAIN TRIGGER FUNCTION ───────────────────────────────────────────────────
// Call this from ANY controller:
//   notificationService.trigger("TASK_ASSIGNED", {
//     recipientPhone: "9876543210",
//     recipientName: "Ramesh",
//     recipientId: employee._id,
//     name: "Ramesh",
//     taskName: "KYC Verification",
//     dueDate: "2026-05-01",
//     assignedBy: "Admin",
//   })
//
const trigger = async (eventKey, data = {}) => {
  try {
    // 1. Find active template
    const template = await NotificationTemplate.findOne({
      eventKey: eventKey.toUpperCase(),
      isActive: true,
    });

    if (!template) {
      console.log(`ℹ️  No active notification template for event: ${eventKey}`);
      return { sent: false, reason: "no_template" };
    }

    // 2. Fill in the message
    const messageContent = fillTemplate(template.messageTemplate, data);

    // 3. Validate phone
    const phone = data.recipientPhone;
    if (!phone) {
      console.warn(`⚠️  No recipientPhone provided for ${eventKey}`);
      await logNotification({
        eventKey,
        recipientPhone: "",
        recipientName: data.recipientName || data.name || "",
        recipientId: data.recipientId,
        messageContent,
        channel: template.channel,
        status: "failed",
        errorMessage: "No recipient phone number provided",
        metadata: { eventKey, ...data },
      });
      return { sent: false, reason: "no_phone" };
    }

    // 4. Send based on channel
    let result = { success: false, error: "Unknown channel" };
    const channel = template.channel || "whatsapp";

    if (channel === "whatsapp" || channel === "both") {
      result = await sendWhatsApp(phone, messageContent);

      await logNotification({
        eventKey,
        recipientPhone: phone,
        recipientName: data.recipientName || data.name || "",
        recipientId: data.recipientId,
        messageContent,
        channel: "whatsapp",
        status: result.success ? "sent" : "failed",
        errorMessage: result.error || "",
        twilioSid: result.sid || "",
        metadata: { eventKey, ...data },
      });
    }

    if (channel === "sms" || channel === "both") {
      const smsResult = await sendSMS(phone, messageContent);

      await logNotification({
        eventKey,
        recipientPhone: phone,
        recipientName: data.recipientName || data.name || "",
        recipientId: data.recipientId,
        messageContent,
        channel: "sms",
        status: smsResult.success ? "sent" : "failed",
        errorMessage: smsResult.error || "",
        twilioSid: smsResult.sid || "",
        metadata: { eventKey, ...data },
      });

      // If we're in "both" mode, report success if either worked
      if (channel === "both") {
        result = smsResult.success || result.success
          ? { success: true, sid: smsResult.sid || result.sid }
          : smsResult;
      } else {
        result = smsResult;
      }
    }

    console.log(`📱 Notification [${eventKey}] → ${phone}: ${result.success ? "✅ Sent" : "❌ Failed"}`);
    return { sent: result.success, sid: result.sid, error: result.error };
  } catch (error) {
    console.error(`❌ notificationService.trigger(${eventKey}) error:`, error.message);
    return { sent: false, reason: "error", error: error.message };
  }
};

// ─── BULK TRIGGER (for multiple recipients) ──────────────────────────────────
const triggerBulk = async (eventKey, recipientDataArray = []) => {
  const results = [];
  for (const data of recipientDataArray) {
    const result = await trigger(eventKey, data);
    results.push({ ...result, phone: data.recipientPhone });
  }
  return results;
};

const notificationService = {
  trigger,
  triggerBulk,
  fillTemplate,
  formatPhone,
};

export default notificationService;
