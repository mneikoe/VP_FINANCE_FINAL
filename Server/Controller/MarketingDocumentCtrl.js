const fs = require("fs");
const path = require("path");
const MarketingDocument = require("../Models/MarketingDocumentModel");
const Kycdocument = require("../Models/kycmodel/documentname");

const buildPublicFilePath = (fileUrl) =>
  path.join(__dirname, "..", "public", fileUrl.replace(/^\/documents\//, "Documents/"));

const syncDocumentNameWithType = async (documentTypeId, documentName) => {
  if (!documentTypeId || !documentName) {
    return;
  }
  const trimmedName = String(documentName).trim();
  if (!trimmedName) {
    return;
  }
  await Kycdocument.findByIdAndUpdate(documentTypeId, {
    $addToSet: { documentNames: trimmedName },
  });
};

exports.createMarketingDocument = async (req, res) => {
  try {
    const { financialProduct, company, documentType, documentName, department } = req.body;
    if (!financialProduct || !company || !documentType || !documentName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file." });
    }

    const normalizedDepartment =
      department === "servicing" ? "servicing" : "marketing";

    const fileUrl = `/documents/marketing-docs/${req.file.filename}`;
    const created = await MarketingDocument.create({
      financialProduct,
      company,
      documentType,
      documentName,
      department: normalizedDepartment,
      fileUrl,
      fileOriginalName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSize: req.file.size,
      lastUploadedAt: new Date(),
      uploadHistory: [
        {
          fileUrl,
          fileOriginalName: req.file.originalname,
          uploadedAt: new Date(),
        },
      ],
    });

    await syncDocumentNameWithType(documentType, documentName);

    const populated = await MarketingDocument.findById(created._id)
      .populate("financialProduct", "name")
      .populate("company", "companyName")
      .populate("documentType", "name");

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create record", error: error.message });
  }
};

exports.getMarketingDocuments = async (req, res) => {
  try {
    const requestedDepartment = req.query.department;
    const query =
      requestedDepartment === "marketing" || requestedDepartment === "servicing"
        ? { department: requestedDepartment }
        : {};

    const docs = await MarketingDocument.find(query)
      .populate("financialProduct", "name")
      .populate("company", "companyName")
      .populate("documentType", "name")
      .sort({ lastUploadedAt: -1, createdAt: -1 });
    return res.status(200).json(docs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch records", error: error.message });
  }
};

exports.updateMarketingDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await MarketingDocument.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Record not found" });
    }

    const updateData = {
      financialProduct: req.body.financialProduct || doc.financialProduct,
      company: req.body.company || doc.company,
      documentType: req.body.documentType || doc.documentType,
      documentName: req.body.documentName || doc.documentName,
    };

    if (req.file) {
      if (doc.fileUrl) {
        const oldPath = buildPublicFilePath(doc.fileUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.fileUrl = `/documents/marketing-docs/${req.file.filename}`;
      updateData.fileOriginalName = req.file.originalname;
      updateData.fileMimeType = req.file.mimetype;
      updateData.fileSize = req.file.size;
      updateData.lastUploadedAt = new Date();
      updateData.$push = {
        uploadHistory: {
          fileUrl: updateData.fileUrl,
          fileOriginalName: req.file.originalname,
          uploadedAt: new Date(),
        },
      };
    }

    await syncDocumentNameWithType(updateData.documentType, updateData.documentName);

    const updated = await MarketingDocument.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("financialProduct", "name")
      .populate("company", "companyName")
      .populate("documentType", "name");

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update record", error: error.message });
  }
};

exports.deleteMarketingDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await MarketingDocument.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (doc.fileUrl) {
      const filePath = buildPublicFilePath(doc.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await MarketingDocument.findByIdAndDelete(id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete record", error: error.message });
  }
};
