const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const marketingTaskCtrl = require("../Controller/MarketingCtrl");
const upload = require("../config/multer");

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "downloadFormUrl", maxCount: 1 },
  { name: "sampleFormUrl", maxCount: 1 },
]);

// Create a new task
router.post("/", uploadFields, marketingTaskCtrl.createTask);

// Get all tasks
router.get("/", marketingTaskCtrl.getAllTasks);

// Get a task by ID
router.get("/:id", marketingTaskCtrl.getTaskById);

// Update a task by ID
// router.put("/:id", marketingTaskCtrl.updateTask);
router.put("/:id", uploadFields, marketingTaskCtrl.updateTask);

// Delete a task by ID
router.delete("/delete/:id", marketingTaskCtrl.deleteTask);

module.exports = router;
