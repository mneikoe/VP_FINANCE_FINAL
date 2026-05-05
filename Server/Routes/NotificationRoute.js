// Routes/NotificationRoute.js
const express = require("express");
const router = express.Router();
const NotificationCtrl = require("../Controller/NotificationCtrl");

// ─── Template CRUD ─────────────────────────────────────────
router.get("/templates", NotificationCtrl.getAllTemplates);
router.get("/templates/:id", NotificationCtrl.getTemplateById);
router.post("/templates", NotificationCtrl.createTemplate);
router.put("/templates/:id", NotificationCtrl.updateTemplate);
router.delete("/templates/:id", NotificationCtrl.deleteTemplate);
router.patch("/templates/:id/toggle", NotificationCtrl.toggleTemplate);

// ─── Seed default templates ────────────────────────────────
router.post("/templates/seed", NotificationCtrl.seedDefaultTemplates);

// ─── Notification Logs ─────────────────────────────────────
router.get("/logs", NotificationCtrl.getLogs);

// ─── Test Notification ─────────────────────────────────────
router.post("/test", NotificationCtrl.sendTestNotification);

module.exports = router;
