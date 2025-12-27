const express = require("express");
const router = express.Router();
const SuspectCtrl = require("../Controller/SuspectCtrl");
const upload = require("../config/upload");

// Create Suspect
router.post("/create", SuspectCtrl.createSuspect);

// Add Family Members
router.put("/add/family/:id", SuspectCtrl.addFamilyMember);

// Add Financial Info
router.put(
  "/add/financialinfo/:id",
  upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
  ]),
  SuspectCtrl.addFinancialInfo
);

// Add Future Priorities
router.put(
  "/add/futurepriorities/:id",
  SuspectCtrl.addFuturePrioritiesAndNeeds
);

// Add Proposed Financial Plan
router.put(
  "/add/proposedplan/:id",
  upload.array("documents"),
  SuspectCtrl.addProposedFinancialPlan
);

// Update Personal Details
router.put("/update/personaldetails/:id", SuspectCtrl.updatePersonalDetails);

// Get All Suspects
router.get("/all", SuspectCtrl.getAllSuspects);

//fetch all appointment done
router.get(
  "/allappointmentscheduled",
  SuspectCtrl.getAllSuspectsAppointmentScheduled
);

// Get Suspect by ID
router.get("/:id", SuspectCtrl.getSuspectById);

// Update Suspect Status
router.put("/update/status/:id", SuspectCtrl.updateSuspectStatus);

// Get All Family Members
router.get("/family/details/:id", SuspectCtrl.getAllFamilyMembers);

// Delete Suspect
router.delete("/delete/:id", SuspectCtrl.deleteSuspect);

// Add Call Task
router.post("/:id/call-task", SuspectCtrl.addCallTask);
router.get("/appointments/scheduled", SuspectCtrl.getAllAppointmentScheduled);
// Get Call History
router.get("/:id/call-history", SuspectCtrl.getCallHistory);
// routes/suspect.js में नया route add करो
// Get Suspects by Call Task Status (NEW)
router.get("/filter/by-call-status", SuspectCtrl.getSuspectsByCallStatus);
router.get(
  "/suspects/appointments",
  SuspectCtrl.getSuspectsAppointmentScheduled
);
// routes/suspect.js में ये routes add करो:

// Update family members
router.put("/:id/family", SuspectCtrl.updateFamilyMembers);

// Update financial info
router.put("/:id/financial", SuspectCtrl.updateFinancialInfo);

// Update future priorities and needs
router.put("/:id/priorities", SuspectCtrl.updateFuturePrioritiesAndNeeds);

// Update proposed plan
router.put("/:id/proposed-plan", SuspectCtrl.updateProposedFinancialPlan);
module.exports = router;
