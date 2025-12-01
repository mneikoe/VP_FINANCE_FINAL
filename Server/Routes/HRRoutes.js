const express = require("express");
const { registerHR, loginHR, getAllHR, getHRById, updateHR, deleteHR } = require("../Controller/HRController");


const router = express.Router();

// Public routes
router.post("/register", registerHR);
router.post("/login", loginHR);

// Protected routes
router.get("/",   getAllHR);
router.get("/:id",  getHRById);
router.put("/:id",  updateHR);
router.delete("/:id",  deleteHR);

module.exports = router;