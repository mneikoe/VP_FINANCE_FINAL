const express = require("express");
const router = express.Router();

const {
  createDepartmentFinancialProduct,
  getAllDepartmentFinancialProducts,
  getDepartmentFinancialProductById,
  updateDepartmentFinancialProduct,
  deleteDepartmentFinancialProduct,
} = require("../../Controller/FormController/FormFinancialProduct");

// ==========================
// CREATE
// ==========================
router.post("/", createDepartmentFinancialProduct);

// ==========================
// GET ALL
// ==========================
router.get("/", getAllDepartmentFinancialProducts);

// ==========================
// GET BY ID
// ==========================
router.get("/:id", getDepartmentFinancialProductById);

// ==========================
// UPDATE
// ==========================
router.put("/:id", updateDepartmentFinancialProduct);

// ==========================
// DELETE
// ==========================
router.delete("/:id", deleteDepartmentFinancialProduct);

module.exports = router;
