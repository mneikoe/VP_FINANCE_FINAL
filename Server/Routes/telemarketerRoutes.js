const express = require("express");
const {registerTelemarketer,loginTelemarketer } = require("../Controller/telemarketerController");

const router = express.Router();

router.post("/register", registerTelemarketer);
router.post("/login", loginTelemarketer);

module.exports = router;
