const express = require("express");
const router = express.Router();

const {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank,
  toggleBankStatus,
} = require("../Controller/BankCtrl");

/* CREATE */
router.post("/", createBank);

/* GET ALL */
router.get("/", getBanks);

/* GET SINGLE */
router.get("/:id", getBankById);

/* UPDATE */
router.put("/:id", updateBank);

/* DELETE */
router.delete("/:id", deleteBank);

/* TOGGLE ACTIVE */
router.patch("/toggle/:id", toggleBankStatus);

module.exports = router;