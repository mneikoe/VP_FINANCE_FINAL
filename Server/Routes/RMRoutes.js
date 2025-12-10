const express = require("express");
const {
  getAllRMs,
  getRMAssignments,
  assignProspectsToRM,
  getProspectsForAssignment,
  getRMStatistics,
} = require("../Controller/RMController");

const router = express.Router();

// ✅ Get all RMs
router.get("/all", getAllRMs);

// ✅ Get RM assignments
router.get("/assignments", getRMAssignments);

// ✅ Assign prospects to RM
router.post("/assign-prospects", assignProspectsToRM);

// ✅ Get prospects for assignment (status: "prospect" and appointment scheduled)
router.get("/prospects-for-assignment", getProspectsForAssignment);

// ✅ Get RM statistics
router.get("/statistics", getRMStatistics);

module.exports = router;
