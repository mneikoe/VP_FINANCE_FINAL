const mongoose = require("mongoose");

const IncomeExpenseAccountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      index: true,
    },

    /* Structured mode */
    headRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProduct",
      default: null,
      index: true,
    },

    subHeadRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },

    /* Custom mode */
    headCustom: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    subHeadCustom: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* 🔥 Validation Logic */
IncomeExpenseAccountSchema.pre("validate", function (next) {
  const hasStructuredHead = this.headRef;
  const hasCustomHead = this.headCustom;

  if (!hasStructuredHead && !hasCustomHead) {
    return next(new Error("Head is required (structured or custom)"));
  }

  if (hasStructuredHead && hasCustomHead) {
    return next(new Error("Use either structured head OR custom head"));
  }

  if (this.subHeadRef && this.subHeadCustom) {
    return next(new Error("Use either structured subhead OR custom subhead"));
  }

  next();
});

module.exports = mongoose.model(
  "IncomeExpenseAccount",
  IncomeExpenseAccountSchema
);