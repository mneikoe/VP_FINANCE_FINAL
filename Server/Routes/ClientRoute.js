const express = require("express");
const router = express.Router();
const ClientCtrl = require("../Controller/ClientCtrl");
const upload = require("../config/upload");



// create client
router.post("/create", ClientCtrl.createClient);

// add family members
router.post("/add/family/:clientId", ClientCtrl.addFamilyMember);
router.put("/update/family/:clientId", ClientCtrl.updateFamilyMember);



// add financial info
// router.put( "/add/financialinfo/:clientId",
//  upload.fields([
//     { name: "insuranceDocuments", maxCount: 10 },
//     { name: "investmentDocuments", maxCount: 10 },
//     { name: "loanDocuments", maxCount: 10 },
// ]),
//   ClientCtrl.addFinancialInfo
// );

router.post(
  "/add/financial/:clientId",
  upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
  ]),
   ClientCtrl.addFinancialInfo
);

router.put(
  "/update/financial/:clientId",
  upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
  ]),
 ClientCtrl.updateFinancialInfo
);

router.post(
  "/add/future-priorities/:clientId",
  ClientCtrl.addFuturePrioritiesAndNeeds
);

router.put(
  "/update/future-priorities/:clientId",
  ClientCtrl.updateFuturePrioritiesAndNeeds
);

// ✅ Proposed Financial Plan Routes
router.post(
  "/add/proposed-plan/:clientId",
  upload.array("documents", 10), // agar file upload karni hai
  ClientCtrl.addProposedFinancialPlan
);

router.put(
  "/update/proposed-plan/:clientId/:planId",
  upload.array("documents", 10), // optional file update ke liye
  ClientCtrl.updateProposedFinancialPlan
);


// add proposed financial plan
router.put("/add/proposedplan/:clientId", upload.array("documents"), ClientCtrl.addProposedFinancialPlan)
//update proposed status
router.put("/add/updateproposedplan/:clientId",  ClientCtrl.updatePorposedStatus)



// update personal details of the client
router.put("/update/personaldetails/:clientId", ClientCtrl.updatePersonalDetails);
router.put("/update/image/:firstId", upload.single('document'),ClientCtrl.updateImage);


// Get All Clients
router.get("/all", ClientCtrl.getAllClients)


// Get Client by ID
router.get("/:id", ClientCtrl.getClientById);


// Update Client Status by ID
router.put("/update/status/:id",  ClientCtrl.updateClientStatus)


// Get all Family Members
router.get("/family/details/:id", ClientCtrl.getAllFamilyMembers)


// Create new KYC (pass clientId as query or param)
router.post('/kyc/create/:clientId', upload.single('document'), ClientCtrl.createKyc);


// Delete Client by ID
router.delete("/delete/:id", ClientCtrl.deleteClient);


// Get all KYCs for a member
router.get('/kyc/:clientId', ClientCtrl.getKycsByClient);


// Update KYC
router.put('/kyc/:id', upload.single('document'), ClientCtrl.updateKyc);


// Delete a KYC
router.delete('/kyc/:id', ClientCtrl.deleteKyc);






module.exports = router;

