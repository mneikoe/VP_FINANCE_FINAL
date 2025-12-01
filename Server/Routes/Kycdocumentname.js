const express = require("express");
const kycrouter = express.Router();
const kycController = require("../Controller/kycdocument");

// CRUD Routes
kycrouter.post("/", kycController.createKycDocument);        // Create
kycrouter.get("/", kycController.getAllKycDocuments);        // Read All
kycrouter.get("/:id", kycController.getKycDocumentById);     // Read One
kycrouter.put("/:id", kycController.updateKycDocument);      // Update
kycrouter.delete("/:id", kycController.deleteKycDocument);   // Delete

module.exports = kycrouter;
