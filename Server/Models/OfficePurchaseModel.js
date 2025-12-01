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
    ratePerUnit: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfficePurchase", OfficePurchaseSchema);
