const express = require("express");
const router = express.Router();
const cityCtrl = require("../../Controller/Lead/CityCtrl");

// Route to get all cities
router.get("/", cityCtrl.getAllCities);

// Route to get a single city by ID
router.get("/:id", cityCtrl.getCityById);

// Route to create a new city
router.post("/", cityCtrl.createCity);

// Route to update a city by ID
router.put("/:id", cityCtrl.updateCity);

// Route to delete a city by ID
router.delete("/delete/:id", cityCtrl.deleteCity);

module.exports = router;
