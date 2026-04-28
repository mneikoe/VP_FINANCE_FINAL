const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
    },

    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Bank", BankSchema);