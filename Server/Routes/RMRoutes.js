// routes/rm.js
const express = require("express");
const router = express.Router();
const rmController = require("../Controller/RMController");

// Get all RMs
router.get("/all", rmController.getAllRMs);

// Get prospects for assignment (old - for prospects)
router.get("/prospects", rmController.getProspectsForAssignment);

// Assign prospects to RM (old - for prospects)
router.post("/assign-prospects", rmController.assignProspectsToRM);

// Get RM assignments
router.get("/assignments", rmController.getRMAssignments);

// Get RM statistics
router.get("/statistics", rmController.getRMStatistics);

// ✅✅✅ NEW ROUTES FOR SUSPECTS ✅✅✅
// Get suspects for assignment (for RMAssignment component)
router.get("/suspects", rmController.getSuspectsForAssignment);

// Assign suspects to RM (for RMAssignment component)
router.post("/assign-suspects", rmController.assignSuspectsToRM);

// Get assigned suspects (for RMAssignment component)
router.get("/assigned-suspects", rmController.getAssignedSuspects);

module.exports = router;
