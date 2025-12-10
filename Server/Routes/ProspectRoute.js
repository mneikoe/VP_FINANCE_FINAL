const express = require("express");
const router = express.Router();
const ProspectCtrl = require("../Controller/ProspectCtrl");
const upload = require("../config/upload");

// ========== GET ROUTES ==========
router.get("/all", ProspectCtrl.getAllProspects); // Get all prospects
router.get("/with-appointments", ProspectCtrl.getProspectsWithAppointments); // Get prospects with appointments
router.get("/stats", ProspectCtrl.getProspectStats); // Get statistics
router.get("/family/details/:id", ProspectCtrl.getAllFamilyMembers); // Get family members
router.get("/:id", ProspectCtrl.getProspectById); // Get by ID

// ========== POST ROUTES ==========
router.post("/create", ProspectCtrl.createProspect); // Create new
router.post("/convert/:suspectId", ProspectCtrl.convertSuspectToProspect); // Convert suspect to prospect

// ========== PUT ROUTES ==========
router.put("/update/personaldetails/:id", ProspectCtrl.updatePersonalDetails);
router.put("/update/status/:id", ProspectCtrl.updateProspectStatus);
router.put("/add/family/:id", ProspectCtrl.addFamilyMember);
router.put(
  "/add/financialinfo/:id",
  upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
  ]),
  ProspectCtrl.addFinancialInfo
);
router.put(
  "/add/futurepriorities/:id",
  ProspectCtrl.addFuturePrioritiesAndNeeds
);
router.put(
  "/add/proposedplan/:id",
  upload.array("documents"),
  ProspectCtrl.addProposedFinancialPlan
);

// ========== DELETE ROUTES ==========
router.delete("/delete/:id", ProspectCtrl.deleteProspect);

module.exports = router;
