// const express = require("express");
// const router = express.Router();
// <<<<<<< HEAD
// const ProspectCtrl = require("../Controller/ProspectCtrl");
// const upload = require("../config/upload");

// // create prospect
// router.post("/create", ProspectCtrl.createProspect);

// // add family members
// router.put("/add/family/:prospectId", ProspectCtrl.addFamilyMember);

// // add financial info
// router.put("/add/financialinfo/:prospectId", ProspectCtrl.addFinancialInfo);

// // add future priotities
// router.put("/add/futurepriorities/:prospectId", ProspectCtrl.addFuturePrioritiesAndNeeds);

// // add proposed financial plan
// router.put("/add/proposedplan/:prospectId", ProspectCtrl.addProposedFinancialPlan);

// // update personal details of the prospect
// router.put("/update/personaldetails/:prospectId", ProspectCtrl.updatePersonalDetails);

// // Get All Prospects
// router.get("/all", ProspectCtrl.getAllProspects);

// // Get Prospect by ID
// router.get("/:id", ProspectCtrl.getProspectById);

// // Update Prospect Status by ID
// router.put("/update/status/:id", ProspectCtrl.updateProspectStatus);

// // Delete Prospect by ID
// router.delete("/delete/:id", ProspectCtrl.deleteProspect);
// =======
// const ProspectCtrl = require("../Controller/ProspectLeadCtrl");

// router.post("/", ProspectCtrl.createProspectLead); // Create
// router.get("/", ProspectCtrl.getProspectLeads); // Read all
// router.get("/:id", ProspectCtrl.getProspectLeadById); // get by Id
// router.put("/:id", ProspectCtrl.updateProspectLead); // Update
// router.delete("/:id", ProspectCtrl.deleteProspectLead); // Delete

// router.put("/status/:id", ProspectCtrl.updateProspectLeadStatus);
// >>>>>>> c8eddd2 (Completed clients full forms with backend and redux as well as clients tab status and delete)

// module.exports = router;




const expres = require("express")
const router = expres.Router()


const ProspectCtrl = require("../Controller/ProspectLeadCtrl");

router.post("/", ProspectCtrl.createProspectLead); // Create
router.get("/", ProspectCtrl.getProspectLeads); // Read all
router.get("/:id", ProspectCtrl.getProspectLeadById); // get by Id
router.put("/:id", ProspectCtrl.updateProspectLead); // Update
router.delete("/:id", ProspectCtrl.deleteProspectLead); // Delete

router.put("/status/:id", ProspectCtrl.updateProspectLeadStatus);