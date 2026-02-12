const mongoose = require("mongoose");

const departmentFinancialProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// ✅ Safe model export (prevents OverwriteModelError)
module.exports =
  mongoose.models.DepartmentFinancialProduct ||
  mongoose.model(
    "DepartmentFinancialProduct",
    departmentFinancialProductSchema,
    "departmentfinancialproducts" // explicit collection name
  );
