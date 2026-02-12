const express = require("express");
const {
  createCompanyName,
  getAllCompanyNames,
  updateCompanyName,
  deleteCompanyName,
} = require("../../Controller/FormController/FormCompanyName");

const router = express.Router();

router.post("/add", createCompanyName);
router.get("/", getAllCompanyNames);
router.put("/:id", updateCompanyName);
router.delete("/:id", deleteCompanyName);

module.exports = router;
