const express = require("express");
const router = express.Router();
const OccupationTypeCtrl = require("../Controller/OccupationTypeCtrl");




// Route to create a new Occupation Type
router.post("/", OccupationTypeCtrl.createOccupationType);

// Route to get all
router.get("/", OccupationTypeCtrl.getAllOccupationTypes);

// Route to get a single  by ID
router.get("/:id", OccupationTypeCtrl.getOccupationTypeById);


// Route to update a  by ID
router.put("/:id", OccupationTypeCtrl.updateOccupationType);

// Route to delete a  by ID
router.delete("/:id", OccupationTypeCtrl.deleteOccupationType);

module.exports = router;
