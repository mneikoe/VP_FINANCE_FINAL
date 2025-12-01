const express = require("express");
const {registerOA,loginOA} = require("../Controller/OAController");

const router = express.Router();

router.post("/register", registerOA);
router.post("/login", loginOA);

module.exports = router;