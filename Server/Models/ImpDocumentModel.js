const mongoose = require("mongoose");

const importantDocumentSchema = new mongoose.Schema(
  {
    documentName: { type: String, required: true },
    documentNumber: { type: String, required: true },
    dateOfIssue: { type: Date, required: true },
    issuingAuthority: { type: String, required: true },
    documentParticulars: { type: String },
    importantDocPdfPath: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportantDocument", importantDocumentSchema);
