const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const importantDocumentController = require("../Controller/ImpDocumentCtrl");

// Create
router.post(
  "/",
  upload.single("importantDocPdfPath"),
  importantDocumentController.createDocument
);

// Read All
router.get("/", importantDocumentController.getAllDocuments);

// Read One
router.get("/:id", importantDocumentController.getDocumentById);

// Update
router.put(
  "/:id",
  upload.single("importantDocPdfPath"),
  importantDocumentController.updateDocument
);

// Delete
router.delete("/:id", importantDocumentController.deleteDocument);

module.exports = router;
