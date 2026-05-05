// models/OfficePurchase.js
const mongoose = require("mongoose");

const OfficePurchaseSchema = new mongoose.Schema(
  {
    vrNo: { type: String, required: true },
    invoiceNo: { type: String, required: true },
    date: { type: Date, required: true },
    headOfACs: { type: String, required: true },
    itemParticulars: { type: String, required: true },
    firmName: { type: String, required: true },
    address: { type: String },
    contactNumber: { type: String },
    ratePerUnit: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    remark: { type: String },
    pdfPath: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfficePurchase", OfficePurchaseSchema);
