const express = require("express");
const router = express.Router();
const companyController = require("../Controller/CompanyNameCtrl");

router.post("/", companyController.createCompanyName);
router.get("/", companyController.getAllCompanies);
router.get("/:id", companyController.getCompanyById);
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

module.exports = router;
