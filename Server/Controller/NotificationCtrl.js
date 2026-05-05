// Controller/NotificationCtrl.js — CRUD for templates, logs, test & seed
import NotificationTemplate from "../Models/NotificationTemplateModel.js";
import NotificationLog from "../Models/NotificationLogModel.js";
import notificationService from "../utils/notificationService.js";

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATES CRUD
// ────────────────────────────────────────────────────────────────────────────

// GET all templates
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await NotificationTemplate.find()
      .sort({ eventKey: 1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Templates fetched successfully",
      data: templates,
    });
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    res.status(500).json({ success: false, message: "Failed to fetch templates", error: error.message });
  }
};

// GET single template by ID
export const getTemplateById = async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch template", error: error.message });
  }
};

// CREATE a new template
export const createTemplate = async (req, res) => {
  try {
    const { eventKey, label, description, recipientType, targetRoles, messageTemplate, availableVariables, isActive, channel } = req.body;

    if (!eventKey || !label || !messageTemplate) {
      return res.status(400).json({
        success: false,
        message: "eventKey, label, and messageTemplate are required",
      });
    }

    // Check if eventKey already exists
    const existing = await NotificationTemplate.findOne({ eventKey: eventKey.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Template with event key '${eventKey}' already exists`,
      });
    }

    const template = await NotificationTemplate.create({
      eventKey: eventKey.toUpperCase(),
      label,
      description: description || "",
      recipientType: recipientType || "assignedTo",
      targetRoles: targetRoles || [],
      messageTemplate,
      availableVariables: availableVariables || [],
      isActive: isActive !== false,
      channel: channel || "whatsapp",
    });

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("❌ Error creating template:", error);
    res.status(500).json({ success: false, message: "Failed to create template", error: error.message });
  }
};

// UPDATE template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing eventKey via update (it's the unique identifier)
    if (updates.eventKey) {
      updates.eventKey = updates.eventKey.toUpperCase();
    }

    const template = await NotificationTemplate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("❌ Error updating template:", error);
    res.status(500).json({ success: false, message: "Failed to update template", error: error.message });
  }
};

// DELETE template
export const deleteTemplate = async (req, res) => {
  try {
    const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete template", error: error.message });
  }
};

// TOGGLE active/inactive
export const toggleTemplate = async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.status(200).json({
      success: true,
      message: `Template ${template.isActive ? "activated" : "deactivated"} successfully`,
      data: template,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle template", error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// NOTIFICATION LOGS
// ────────────────────────────────────────────────────────────────────────────

export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 25, eventKey, status, startDate, endDate, recipientId } = req.query;

    const query = {};
    if (eventKey) query.eventKey = eventKey.toUpperCase();
    if (status) query.status = status;
    if (recipientId) query.recipientId = recipientId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      NotificationLog.find(query)
        .populate("recipientId", "name employeeCode role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      NotificationLog.countDocuments(query),
    ]);

    // Stats
    const stats = await NotificationLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = { sent: 0, failed: 0, queued: 0 };
    stats.forEach((s) => (statsMap[s._id] = s.count));

    res.status(200).json({
      success: true,
      message: "Logs fetched successfully",
      data: logs,
      stats: statsMap,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs", error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// TEST NOTIFICATION
// ────────────────────────────────────────────────────────────────────────────

export const sendTestNotification = async (req, res) => {
  try {
    const { eventKey, phone, testData } = req.body;

    if (!eventKey || !phone) {
      return res.status(400).json({
        success: false,
        message: "eventKey and phone are required for testing",
      });
    }

    // Build test data with defaults
    const data = {
      recipientPhone: phone,
      recipientName: "Test User",
      name: "Test User",
      taskName: "Sample Task",
      dueDate: new Date().toLocaleDateString("en-IN"),
      priority: "medium",
      assignedBy: "Admin",
      remark: "This is a test notification",
      ...testData,
    };

    const result = await notificationService.trigger(eventKey, data);

    res.status(200).json({
      success: true,
      message: result.sent ? "Test notification sent successfully!" : "Test notification failed",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    res.status(500).json({ success: false, message: "Failed to send test notification", error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// SEED DEFAULT TEMPLATES
// ────────────────────────────────────────────────────────────────────────────

export const seedDefaultTemplates = async (req, res) => {
  try {
    const defaults = [
      {
        eventKey: "TASK_ASSIGNED",
        label: "Task Assigned to Employee",
        description: "Sent when a task is assigned to an employee (RM/OE/Telecaller etc.)",
        recipientType: "assignedTo",
        messageTemplate:
          "Namaskar {{name}}, aapko ek naya task assign hua hai:\n\n📋 Task: {{taskName}}\n📅 Due Date: {{dueDate}}\n⚡ Priority: {{priority}}\n👤 Assigned By: {{assignedBy}}\n\nKripya apna kaam time pe complete karein. Dhanyavaad!",
        availableVariables: ["name", "taskName", "dueDate", "priority", "assignedBy", "remarks"],
        isActive: true,
        channel: "whatsapp",
      },
      {
        eventKey: "TASK_FORWARDED_TO_OE",
        label: "Task Forwarded to OE",
        description: "Sent when RM forwards a task to an Operations Executive",
        recipientType: "assignedTo",
        messageTemplate:
          "Namaskar {{name}}, RM {{forwardedBy}} ne aapko ek task forward kiya hai:\n\n📋 Task: {{taskName}}\n💬 Remark: {{remark}}\n\nKripya isse check karein aur action lein.",
        availableVariables: ["name", "taskName", "forwardedBy", "remark"],
        isActive: true,
        channel: "whatsapp",
      },
      {
        eventKey: "TASK_FORWARDED_TO_RM",
        label: "Task Forwarded to RM",
        description: "Sent when OE forwards a task back to an RM",
        recipientType: "assignedTo",
        messageTemplate:
          "Namaskar {{name}}, OE {{forwardedBy}} ne aapko ek task forward kiya hai:\n\n📋 Task: {{taskName}}\n💬 Remark: {{remark}}\n\nKripya review karein.",
        availableVariables: ["name", "taskName", "forwardedBy", "remark"],
        isActive: true,
        channel: "whatsapp",
      },
      {
        eventKey: "TASK_COMPLETED",
        label: "Task Completed",
        description: "Sent when an employee completes a task",
        recipientType: "assignedBy",
        messageTemplate:
          "✅ Task Complete!\n\n📋 Task: {{taskName}}\n👤 Completed By: {{completedBy}}\n📅 Completed At: {{completedAt}}\n💬 Remarks: {{remarks}}\n\nTask successfully complete ho gaya hai.",
        availableVariables: ["taskName", "completedBy", "completedAt", "remarks"],
        isActive: true,
        channel: "whatsapp",
      },
      {
        eventKey: "TASK_OVERDUE",
        label: "Task Overdue Alert",
        description: "Sent when a task passes its due date",
        recipientType: "assignedTo",
        messageTemplate:
          "⚠️ Task Overdue Alert!\n\n📋 Task: {{taskName}}\n📅 Due Date: {{dueDate}}\n⚡ Priority: {{priority}}\n\n{{name}}, yeh task overdue ho gaya hai. Kripya jaldi complete karein!",
        availableVariables: ["name", "taskName", "dueDate", "priority"],
        isActive: true,
        channel: "whatsapp",
      },
      {
        eventKey: "LEAD_ASSIGNED",
        label: "Lead Assigned to Telecaller",
        description: "Sent when a new lead/suspect is assigned to a telecaller",
        recipientType: "assignedTo",
        messageTemplate:
          "📞 Naya Lead Assigned!\n\n👤 Lead Name: {{leadName}}\n📱 Mobile: {{leadMobile}}\n📍 Area: {{leadArea}}\n\n{{name}}, kripya jaldi se jaldi contact karein.",
        availableVariables: ["name", "leadName", "leadMobile", "leadArea"],
        isActive: false,
        channel: "whatsapp",
      },
      {
        eventKey: "APPOINTMENT_BOOKED",
        label: "Appointment Booked",
        description: "Sent when a new appointment is scheduled",
        recipientType: "assignedTo",
        messageTemplate:
          "📅 New Appointment!\n\n👤 Client: {{clientName}}\n📅 Date: {{appointmentDate}}\n🕐 Time: {{appointmentTime}}\n📍 Location: {{location}}\n\n{{name}}, appointment schedule ho gaya hai.",
        availableVariables: ["name", "clientName", "appointmentDate", "appointmentTime", "location"],
        isActive: false,
        channel: "whatsapp",
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const tpl of defaults) {
      const existing = await NotificationTemplate.findOne({ eventKey: tpl.eventKey });
      if (existing) {
        skipped++;
        continue;
      }
      await NotificationTemplate.create(tpl);
      created++;
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${created} default templates (${skipped} already existed)`,
      data: { created, skipped, total: defaults.length },
    });
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    res.status(500).json({ success: false, message: "Failed to seed templates", error: error.message });
  }
};
