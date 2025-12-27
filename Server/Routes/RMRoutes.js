const express = require("express");
const router = express.Router();
const rmController = require("../Controller/RMController");

// Get all RMs
router.get("/all", rmController.getAllRMs);

// ✅ SUSPECTS ROUTES ONLY (remove prospects routes)
// Get suspects for assignment (with appointments)
router.get("/suspects", rmController.getSuspectsForAssignment);

// Assign suspects to RM
router.post("/assign-suspects", rmController.assignSuspectsToRM);

// Get assigned suspects for a specific RM
router.get("/assigned-suspects", rmController.getAssignedSuspects);

// Get RM statistics (you may want to update this too)
router.get("/statistics", rmController.getRMStatistics);

// REMOVE THESE PROSPECTS ROUTES:
// router.get("/prospects", rmController.getProspectsForAssignment);
// router.post("/assign-prospects", rmController.assignProspectsToRM);
// router.get("/assignments", rmController.getRMAssignments);

module.exports = router;
