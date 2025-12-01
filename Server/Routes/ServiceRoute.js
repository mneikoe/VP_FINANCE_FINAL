const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const serviceTaskCtrl = require("../Controller/ServiceCtrl");
const upload = require("../config/multer");

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "downloadFormUrl", maxCount: 1 },
  { name: "sampleFormUrl", maxCount: 1 },
]);

// Create a new task
router.post("/", uploadFields, serviceTaskCtrl.createTask);

// Get all tasks
router.get("/", serviceTaskCtrl.getAllTasks);

// Get a task by ID
router.get("/:id", serviceTaskCtrl.getTaskById);

// Update a task by ID
// router.put("/:id", serviceTaskCtrl.updateTask);
router.put("/:id", uploadFields, serviceTaskCtrl.updateTask);

// Delete a task by ID
router.delete("/delete/:id", serviceTaskCtrl.deleteTask);

module.exports = router;
