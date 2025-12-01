const express = require("express");
const router = express.Router();
const companyController = require("../Controller/CREController");

console.log("CRE router call");

router.post("/", companyController.registerCRE);

module.exports = router;
