const express = require("express");
const router = express.Router();
const officePurchaseCtrl = require("../Controller/OfficePurchaseCtrl");
const upload = require("../config/multer");

const uploadFields = upload.fields([{ name: "invoicePdf", maxCount: 1 }]);

// Create
router.post("/", uploadFields, officePurchaseCtrl.createOfficePurchase);

// Read all
router.get("/", officePurchaseCtrl.getAllOfficePurchases);

// Read one
router.get("/:id", officePurchaseCtrl.getOfficePurchaseById);

// Update
router.put("/update/:id", uploadFields, officePurchaseCtrl.updateOfficePurchase);

// Delete
router.delete("/delete/:id", officePurchaseCtrl.deleteOfficePurchase);

module.exports = router;
