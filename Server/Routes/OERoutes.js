const express = require("express");
const {registerOE,loginOE} = require("../Controller/OEController");

const router = express.Router();

router.post("/register", registerOE);
router.post("/login", loginOE);

module.exports = router;
