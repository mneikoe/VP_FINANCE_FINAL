const express = require("express");
const router = express.Router();
const AmcCtrl = require("../Controller/AMCCtrl");

// Create AMC
router.post("/", AmcCtrl.createAMC);

// Read all AMCs
router.get("/", AmcCtrl.getAllAMCs);

// Read single AMC by ID
router.get("/:id", AmcCtrl.getAMCById);

// Update AMC by ID
router.put("/:id", AmcCtrl.updateAMC);

// Delete AMC by ID
router.delete("/:id", AmcCtrl.deleteAMC);

module.exports = router;
