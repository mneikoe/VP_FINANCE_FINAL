const mongoose = require("mongoose");

const IncomeExpenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },

    accountRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncomeExpenseAccount",
      required: true,
      index: true,
    },

    bankRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },

    description: String,

    bill: {
      type: String, // file path
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IncomeExpense", IncomeExpenseSchema);