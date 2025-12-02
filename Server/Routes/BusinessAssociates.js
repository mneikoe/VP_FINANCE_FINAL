const express = require("express");
const router = express.Router();
const BusinessAssociate = require("../Models/BusinessAssociate");

// Get all business associates
router.get("/", async (req, res) => {
  try {
    const associates = await BusinessAssociate.find().sort({ createdAt: -1 });
    res.json({ success: true, data: associates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single business associate
router.get("/:id", async (req, res) => {
  try {
    const associate = await BusinessAssociate.findById(req.params.id);
    if (!associate) {
      return res
        .status(404)
        .json({ success: false, message: "Associate not found" });
    }
    res.json({ success: true, data: associate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create business associate
router.post("/", async (req, res) => {
  try {
    // Check if email already exists
    const existingEmail = await BusinessAssociate.findOne({
      emailId: req.body.emailId,
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if PAN already exists
    const existingPAN = await BusinessAssociate.findOne({
      panNumber: req.body.panNumber,
    });
    if (existingPAN) {
      return res.status(400).json({
        success: false,
        message: "PAN number already registered",
      });
    }

    // Check if username already exists
    const existingUsername = await BusinessAssociate.findOne({
      "loginCredentials.username": req.body.loginCredentials.username,
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    const associate = new BusinessAssociate(req.body);
    await associate.save();

    res.status(201).json({ success: true, data: associate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update business associate
router.put("/:id", async (req, res) => {
  try {
    const associate = await BusinessAssociate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!associate) {
      return res
        .status(404)
        .json({ success: false, message: "Associate not found" });
    }

    res.json({ success: true, data: associate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete business associate
router.delete("/:id", async (req, res) => {
  try {
    const associate = await BusinessAssociate.findByIdAndDelete(req.params.id);

    if (!associate) {
      return res
        .status(404)
        .json({ success: false, message: "Associate not found" });
    }

    res.json({ success: true, message: "Associate deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search business associates
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const associates = await BusinessAssociate.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { emailId: { $regex: query, $options: "i" } },
        { mobileNumber1: { $regex: query, $options: "i" } },
        { subbrokerCode: { $regex: query, $options: "i" } },
        { panNumber: { $regex: query, $options: "i" } },
      ],
    }).sort({ name: 1 });

    res.json({ success: true, data: associates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
