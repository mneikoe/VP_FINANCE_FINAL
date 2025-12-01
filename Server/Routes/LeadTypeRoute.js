const express = require("express");
const router = express.Router();
const leadTypeCtrl = require("../Controller/LeadTypeCtrl");

// Route to get all
router.get("/", leadTypeCtrl.getAllleadTypes);

// Route to get a single  by ID
router.get("/:id", leadTypeCtrl.getleadTypeById);

// Route to create a new city
router.post("/", leadTypeCtrl.createleadType);

// Route to update a  by ID
router.put("/:id", leadTypeCtrl.updateleadType);

// Route to delete a  by ID
router.delete("/delete/:id", leadTypeCtrl.deleteleadType);

module.exports = router;
