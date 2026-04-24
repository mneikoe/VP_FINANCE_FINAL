const Kycdocument = require("../Models/kycmodel/documentname");
const mongoose = require("mongoose");
// ✅ Create KYC Document
exports.createKycDocument = async (req, res) => {
  try {
    const { name, documentNames } = req.body;
    const normalizedTypeName = String(name || "").trim();
    if (!normalizedTypeName) {
      return res.status(400).json({ message: "Document type name is required" });
    }

    const normalizedNames = Array.isArray(documentNames)
      ? [...new Set(documentNames.map((item) => String(item || "").trim()).filter(Boolean))]
      : [];

    const newDoc = new Kycdocument({ name: normalizedTypeName, documentNames: normalizedNames });
    await newDoc.save();

    res.status(201).json({ message: "KYC Document created successfully", data: newDoc });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Document type already exists" });
    }
    res.status(500).json({ message: "Error creating KYC Document", error: error.message });
  }
};

// ✅ Get All KYC Documents
exports.getAllKycDocuments = async (req, res) => {
  try {
    const docs = await Kycdocument.find();
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching KYC Documents", error: error.message });
  }
};

// ✅ Get Single KYC Document by ID
exports.getKycDocumentById = async (req, res) => {
  try {
    const doc = await Kycdocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "KYC Document not found" });
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching document", error: error.message });
  }
};

// ✅ Update KYC Document
exports.updateKycDocument = async (req, res) => {
  try {
    const { name, documentNames } = req.body;

    const updateData = {};
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (Array.isArray(documentNames)) {
      updateData.documentNames = [
        ...new Set(documentNames.map((item) => String(item || "").trim()).filter(Boolean)),
      ];
    }

    const updatedDoc = await Kycdocument.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "KYC Document not found" });
    }

    res.status(200).json({ message: "Document updated successfully", data: updatedDoc });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Document type already exists" });
    }
    res.status(500).json({ message: "Error updating document", error: error.message });
  }
};

// ✅ Delete KYC Document
exports.deleteKycDocument = async (req, res) => {
  try {
    const deletedDoc = await Kycdocument.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      return res.status(404).json({ message: "KYC Document not found" });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
};
