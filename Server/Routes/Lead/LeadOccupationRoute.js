const express = require("express");
const router = express.Router();
const OccupationCtrl = require("../../Controller/Lead/LeadOccupationCtrl");



// create Occupation
router.post("/", OccupationCtrl.createOccupation); 
// Get All Occupations
router.get("/", OccupationCtrl.getAllOccupations); 
// Get Occupation by ID, Update Occupation, and Delete Occupation
router.get("/:id", OccupationCtrl.getOccupationById); 
router.put("/:id", OccupationCtrl.updateOccupation); 
router.delete("/:id",OccupationCtrl.deleteOccupation); 


module.exports = router;
