const router = require("express").Router();

const {
  getBalanceSheet,
  exportExcel,
  exportPDF,
  bankLedgerPDF,
  bankLedgerExcel,
  bankLedger,
} = require("../Controller/IncomeExpenseReportController");

router.get("/balance-sheet", getBalanceSheet);
router.get("/export-excel", exportExcel);
router.get("/export-pdf", exportPDF);
router.get("/bank-ledger-pdf", bankLedgerPDF);
router.get("/bank-ledger-excel", bankLedgerExcel);
router.get("/bank-ledger", bankLedger);

module.exports = router;