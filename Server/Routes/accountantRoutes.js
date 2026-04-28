const express = require("express");
const router = express.Router();
const {
  registerAccountant,
  loginAccountant,
} = require("../Controller/accountantController");

router.post("/register", registerAccountant);
router.post("/login", loginAccountant);

module.exports = router;