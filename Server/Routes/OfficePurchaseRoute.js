const express = require("express");
const router = express.Router();
const officePurchaseController = require("../Controller/OfficePurchaseCtrl");

// Create
router.post("/", officePurchaseController.createOfficePurchase);

// Read all
router.get("/", officePurchaseController.getAllOfficePurchases);

// Read one
router.get("/:id", officePurchaseController.getOfficePurchaseById);

// Update
router.put("/:id", officePurchaseController.updateOfficePurchase);

// Delete
router.delete("/:id", officePurchaseController.deleteOfficePurchase);

module.exports = router;
