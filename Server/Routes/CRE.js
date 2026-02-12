const express = require("express");
const router = express.Router();
const companyController = require("../Controller/CREController");



router.post("/", companyController.registerCRE);

module.exports = router;
