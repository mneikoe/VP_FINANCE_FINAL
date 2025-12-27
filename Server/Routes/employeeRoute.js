const express = require("express");
const {
  addEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
  getLastEmployeeCode,
  getEmployeeRoles,
  getEmployeesByArea,
  getEmployeeAreas,
} = require("../Controller/employeeController");

const router = express.Router();

router.post("/addEmployee", addEmployee);
router.put("/updateEmployee", updateEmployee);
router.get("/getEmployeeById", getEmployeeById);
router.get("/getAllEmployees", getAllEmployees);
router.delete("/deleteEmployee", deleteEmployee);
router.get("/get-last-code", getLastEmployeeCode);
router.get("/getEmployeeRoles", getEmployeeRoles);
router.get("/getEmployeesByArea", getEmployeesByArea);
router.get("/getEmployeeAreas", getEmployeeAreas);

module.exports = router;
