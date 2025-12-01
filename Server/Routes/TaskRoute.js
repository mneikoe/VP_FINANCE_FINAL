// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const TaskController = require("../Controller/TaskCtrl");
// const upload = require("../config/multer");

// const uploadFields = upload.fields([
//   { name: "image", maxCount: 1 },
//   { name: "downloadFormUrl", maxCount: 1000 },
//   { name: "sampleFormUrl", maxCount: 1000 },
// ]);

// // Create a new task
// router.post("/", uploadFields, TaskController.createTask);

// // Get all tasks
// router.get("/", TaskController.getAllTasks);

// // Get a task by ID
// router.get("/:id", TaskController.getTaskById);

// // Update a task by ID

// router.put("/:id", uploadFields, TaskController.updateTask);

// // Delete a task by ID
// router.delete("/delete/:id", TaskController.deleteTask);

// module.exports = router;





const express = require("express");
const router = express.Router();
const TaskController = require("../Controller/TaskCtrl");
const upload = require("../config/multer");

// Validation middleware
const validateTaskType = (req, res, next) => {
  const validTypes = ['composite', 'marketing', 'service'];
  const type = req.body.type || req.query.type;
  
  if (!type) {
    return res.status(400).json({ 
      message: "Task type is required",
      validTypes 
    });
  }
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      message: `Invalid task type: ${type}`,
      validTypes 
    });
  }
  
  next();
};

// Multer configuration for multiple files
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "downloadFormUrl", maxCount: 50 }, // Reduced from 1000 for better performance
  { name: "sampleFormUrl", maxCount: 50 },
]);

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field' });
    }
  }
  next(error);
};

// Routes
// Create a new task
router.post("/", uploadFields, handleMulterError, validateTaskType, TaskController.createTask);

// Get all tasks (with optional filtering)
router.get("/", validateTaskType, TaskController.getAllTasks);

// Get task statistics
router.get("/stats", TaskController.getTaskStats);

// Get a task by ID
router.get("/:id", validateTaskType, TaskController.getTaskById);

// Update a task by ID
router.put("/:id", uploadFields, handleMulterError, validateTaskType, TaskController.updateTask);

// Update task status
router.patch("/:id/status", validateTaskType, TaskController.updateTaskStatus);

// Delete a task by ID
router.delete("/:id", validateTaskType, TaskController.deleteTask);
router.delete("/delete/:id", validateTaskType, TaskController.deleteTask);

// Bulk operations
router.post("/bulk/delete", validateTaskType, TaskController.bulkDeleteTasks);
router.patch("/bulk/status", validateTaskType, TaskController.bulkUpdateStatus);

module.exports = router;