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
router.get("/allappointmentdone", SuspectCtrl.getAllSuspectsAppointmentDone);

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

// Get Call History
router.get("/:id/call-history", SuspectCtrl.getCallHistory);
// routes/suspect.js में नया route add करो
// Get Suspects by Call Task Status (NEW)
router.get("/filter/by-call-status", SuspectCtrl.getSuspectsByCallStatus);
module.exports = router;
