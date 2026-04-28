const express = require("express");
const { registerOA, loginOA, getAllOA, getOAById } = require("../Controller/OAController");

const router = express.Router();

// Public routes
router.post("/register", registerOA);
router.post("/login", loginOA);

// Protected/Internal routes
router.get("/", getAllOA);
router.get("/:id", getOAById);

module.exports = router;