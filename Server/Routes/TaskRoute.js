// TaskRoute.js - Updated version
const express = require("express");
const router = express.Router();
const TaskController = require("../Controller/TaskCtrl");
const upload = require("../config/multer");

// Validation middleware
const validateTaskType = (req, res, next) => {
  const validTypes = ["composite", "individual", "marketing", "service"];
  const type = req.body.type || req.query.type || "composite";

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid task type: ${type}`,
      validTypes,
    });
  }

  next();
};

// Multer configuration
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "downloadFormUrl", maxCount: 10 },
  { name: "sampleFormUrl", maxCount: 10 },
]);

// ✅ ROUTES

// 1. GET all tasks
router.get("/", validateTaskType, TaskController.getAllTasks);

// 2. GET single task
router.get("/:id", validateTaskType, TaskController.getTaskById);

// 3. CREATE task
router.post("/", uploadFields, validateTaskType, TaskController.createTask);

// 4. UPDATE task
router.put("/:id", uploadFields, validateTaskType, TaskController.updateTask);

// 5. DELETE task
router.delete("/delete/:id", validateTaskType, TaskController.deleteTask);

// 6. Special routes
router.get("/templates/composite", TaskController.getCompositeTemplates);
router.get("/for-employee/:employeeId", TaskController.getTasksByEmployeeRole);
router.get("/by-role/:role", TaskController.getTasksByRole);
// ✅ FIXED: Add the missing assign-composite route
router.post("/assign-composite", TaskController.assignCompositeTask);
router.get("/assigned/:employeeId", TaskController.getAssignedTasks);
router.get("/templates/marketing", TaskController.getMarketingTemplates);
router.get(
  "/marketing/for-employee/:employeeId",
  TaskController.getMarketingTasksByEmployeeRole
);
router.get(
  "/marketing/assigned/:employeeId",
  TaskController.getAssignedMarketingTasks
);
router.get("/marketing/stats", TaskController.getMarketingTaskStats);
router.get("/marketing/:id", TaskController.getMarketingTaskById);
router.post("/assign-marketing", TaskController.assignMarketingTask);
router.put("/marketing/:id", uploadFields, TaskController.updateMarketingTask);
router.delete("/marketing/:id", TaskController.deleteMarketingTask);
router.get("/templates/service", TaskController.getServiceTemplates);
router.get(
  "/service/for-employee/:employeeId",
  TaskController.getServiceTasksByEmployeeRole
);
router.get(
  "/service/assigned/:employeeId",
  TaskController.getAssignedServiceTasks
);
router.get("/service/stats", TaskController.getServiceTaskStats);
router.get("/service/:id", TaskController.getServiceTaskById);
router.post("/assign-service", TaskController.assignServiceTask);
router.put("/service/:id", uploadFields, TaskController.updateServiceTask);
router.delete("/service/:id", TaskController.deleteServiceTask);
router.put(
  "/entity/:entityId/task/:taskId/status",

  TaskController.updateEntityTaskStatus
);

// ✅ Get entity task history
router.get(
  "/entity/:entityId/task-history",

  TaskController.getEntityTaskHistory
);

// ✅ Get specific task status for entity
router.get(
  "/entity/:entityId/task/:taskId/status",

  TaskController.getEntityTaskStatus
);
router.put(
  "/:taskId/status",

  TaskController.updateTaskStatus
);
module.exports = router;
