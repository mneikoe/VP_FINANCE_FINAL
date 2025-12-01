const ImportantDocument = require("../Models/ImpDocumentModel");
const path = require("path");
const fs = require("fs");

exports.createDocument = async (req, res) => {
  try {
    const pdfPath = req.file ? `/Images/${req.file.filename}` : null;

    const newDoc = new ImportantDocument({
      ...req.body,
      importantDocPdfPath: pdfPath,
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ message: "Failed to create document", error });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await ImportantDocument.find().sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve documents", error });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await ImportantDocument.findById(req.params.id);
    if (!document)
      return res.status(404).json({ message: "Document not found" });
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve document", error });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const doc = await ImportantDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Remove old file if new one is uploaded
    if (req.file && doc.importantDocPdfPath) {
      const oldPath = path.join(
        __dirname,
        "..",
        "public",
        doc.importantDocPdfPath
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updatedData = {
      ...req.body,
      importantDocPdfPath: req.file
        ? `/Images/${req.file.filename}`
        : doc.importantDocPdfPath,
    };

    const updatedDoc = await ImportantDocument.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: "Failed to update document", error });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await ImportantDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (doc.importantDocPdfPath) {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        doc.importantDocPdfPath
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await ImportantDocument.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete document", error });
  }
};
