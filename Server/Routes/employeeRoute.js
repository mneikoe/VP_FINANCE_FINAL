const express = require("express");
const { 
  addEmployee, 
  updateEmployee, 
  getEmployeeById, 
  getAllEmployees, 
  deleteEmployee,
  getLastEmployeeCode // Add this
} = require("../Controller/employeeController");

const router = express.Router();

router.post("/addEmployee", addEmployee);
router.put("/updateEmployee", updateEmployee);
router.get("/getEmployeeById", getEmployeeById);
router.get("/getAllEmployees", getAllEmployees);
router.delete("/deleteEmployee", deleteEmployee);
router.get("/get-last-code", getLastEmployeeCode); // Add this route

module.exports = router;