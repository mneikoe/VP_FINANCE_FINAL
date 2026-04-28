const express = require("express");
const router = express.Router();
const controller = require("../Controller/IncomeExpenseController");
const upload = require("../config/upload");

/* ================= CREATE ================= */
router.post("/", upload.single("bill"), controller.createTransaction);

/* ================= GET ALL ================= */
router.get("/", controller.getTransactions);

/* ================= SUMMARY ================= */
router.get("/summary", controller.getBalanceSummary);

/* ================= BANK SUMMARY ================= */
router.get("/bank-summary", controller.getBankSummary);

/* ================= GET BY ID ================= */
router.get("/:id", controller.getTransactionById);

/* ================= UPDATE ================= */
router.put("/:id", upload.single("bill"), controller.updateTransaction);

/* ================= DELETE ================= */
router.delete("/:id", controller.deleteTransaction);

module.exports = router;