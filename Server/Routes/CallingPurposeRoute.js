const express = require("express");
const router = express.Router();
const callingPurposeCtrl = require("../Controller/CallingPurposeCtrl");

router.get("/", callingPurposeCtrl.getAllCallingPurposes);
router.get("/:id", callingPurposeCtrl.getCallingPurposeById);
router.post("/", callingPurposeCtrl.createCallingPurpose);
router.put("/:id", callingPurposeCtrl.updateCallingPurpose);
router.delete("/delete/:id", callingPurposeCtrl.deleteCallingPurpose);

module.exports = router;
