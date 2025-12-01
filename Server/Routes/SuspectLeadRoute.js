// const express = require("express");
// const router = express.Router();
// <<<<<<< HEAD
// const SuspectCtrl = require("../Controller/SuspectCtrl");
// const upload = require("../config/upload");

// // create suspect
// router.post("/create", SuspectCtrl.createSuspect);

// // add family members
// router.put("/add/family/:suspectId", SuspectCtrl.addFamilyMember);

// // add financial info
// router.put("/add/financialinfo/:suspectId", SuspectCtrl.addFinancialInfo);

// // add future priotities
// router.put("/add/futurepriorities/:suspectId", SuspectCtrl.addFuturePrioritiesAndNeeds);

// // add proposed financial plan
// router.put("/add/proposedplan/:suspectId", SuspectCtrl.addProposedFinancialPlan);

// // update personal details of the suspect
// router.put("/update/personaldetails/:suspectId", SuspectCtrl.updatePersonalDetails);

// // Get All Suspects
// router.get("/all", SuspectCtrl.getAllSuspects);

// // Get Suspect by ID
// router.get("/:id", SuspectCtrl.getSuspectById);

// // Update Suspect Status by ID
// router.put("/update/status/:id", SuspectCtrl.updateSuspectStatus);

// // Delete Suspect by ID
// router.delete("/delete/:id", SuspectCtrl.deleteSuspect);
// =======
// const controller = require("../Controller/SuspectLeadCtrl");

// router.post("/", controller.createSuspectLead); // Create
// router.get("/", controller.getSuspectLeads); // Read all
// router.get("/:id", controller.getSuspectLeadById); // get by Id
// router.put("/:id", controller.updateSuspectLead); // Update
// router.delete("/:id", controller.deleteSuspectLead); // Delete
// >>>>>>> c8eddd2 (Completed clients full forms with backend and redux as well as clients tab status and delete)

// module.exports = router;


const expres = require("express");
const router = expres.Router();



const controller = require("../Controller/SuspectLeadCtrl");

router.post("/", controller.createSuspectLead); // Create
router.get("/", controller.getSuspectLeads); // Read all
router.get("/:id", controller.getSuspectLeadById); // get by Id
router.put("/:id", controller.updateSuspectLead); // Update
router.delete("/:id", controller.deleteSuspectLead); // Delete