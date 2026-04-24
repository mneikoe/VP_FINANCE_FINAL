const express = require("express");
const router = express.Router();
const upload = require("../config/marketingDocumentUpload");
const ctrl = require("../Controller/MarketingDocumentCtrl");

router.get("/", ctrl.getMarketingDocuments);
router.post("/", upload.single("file"), ctrl.createMarketingDocument);
router.put("/:id", upload.single("file"), ctrl.updateMarketingDocument);
router.delete("/:id", ctrl.deleteMarketingDocument);

module.exports = router;
