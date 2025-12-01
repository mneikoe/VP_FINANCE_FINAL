const express = require("express");
const router = express.Router();
const LeadSourceCtrl = require("../../Controller/Lead/LeadSourceCtrl");

router.post("/", LeadSourceCtrl.createLead); // Create
router.get("/", LeadSourceCtrl.getLeads); // Read
router.put("/:id", LeadSourceCtrl.updateLead); // Update
router.delete("/:id", LeadSourceCtrl.deleteLead); // Delete

module.exports = router;
