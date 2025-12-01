
const express = require("express");
const router = express.Router();
const ProspectCtrl = require("../Controller/ProspectCtrl");
const upload = require("../config/upload");



// create prospect
router.post("/create", ProspectCtrl.createProspect);


// add family members
router.put("/add/family/:id", ProspectCtrl.addFamilyMember);

// add financial info
router.put( "/add/financialinfo/:id",
 upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
]),
  ProspectCtrl.addFinancialInfo
);


// add future priotities
router.put("/add/futurepriorities/:id", ProspectCtrl.addFuturePrioritiesAndNeeds)


// add proposed financial plan
router.put("/add/proposedplan/:id", upload.array("documents"), ProspectCtrl.addProposedFinancialPlan)



// update personal details of the suspect
router.put("/update/personaldetails/:id", ProspectCtrl.updatePersonalDetails);


// Get All Prospects
router.get("/all", ProspectCtrl.getAllProspects)


// Get Prospects by ID
router.get("/:id", ProspectCtrl.getProspectById);


// Update Prospect Status by ID
router.put("/update/status/:id", ProspectCtrl.updateProspectStatus)


// Get all Family Members
router.get("/family/details/:id", ProspectCtrl.getAllFamilyMembers)


// Delete Prospect  by ID
router.delete("/delete/:id", ProspectCtrl.deleteProspect);



module.exports = router;
