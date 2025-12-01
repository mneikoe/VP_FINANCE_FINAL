const HR = require("../Models/HRModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerHR = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if HR already exists
    const existingUser = await HR.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newHR = new HR({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "HR",
    });

    await newHR.save();

    res.status(201).json({
      message: "HR registered successfully",
      HR: {
        id: newHR._id,
        username: newHR.username,
        email: newHR.email,
        mobileno: newHR.mobileno,
        role: newHR.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering HR",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginHR = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hr = await HR.findOne({ email });
    if (!hr) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: hr._id, role: hr.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      HR: {
        id: hr._id,
        username: hr.username,
        email: hr.email,
        mobileno: hr.mobileno,
        role: hr.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

// ✅ Get All HR
const getAllHR = async (req, res) => {
  try {
    const hrList = await HR.find().select("-password");
    
    res.json({
      success: true,
      count: hrList.length,
      HRs: hrList
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching HR list",
      error: error.message,
    });
  }
};

// ✅ Get HR by ID
const getHRById = async (req, res) => {
  try {
    const hr = await HR.findById(req.params.id).select("-password");
    
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    res.json({
      success: true,
      HR: hr
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching HR details",
      error: error.message,
    });
  }
};

// ✅ Update HR
const updateHR = async (req, res) => {
  try {
    const { username, mobileno, designation, gender, dob, presentAddress, permanentAddress } = req.body;
    
    const hr = await HR.findById(req.params.id);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    // Update fields
    if (username) hr.username = username;
    if (mobileno) hr.mobileno = mobileno;
    if (designation) hr.designation = designation;
    if (gender) hr.gender = gender;
    if (dob) hr.dob = dob;
    if (presentAddress) hr.presentAddress = presentAddress;
    if (permanentAddress) hr.permanentAddress = permanentAddress;

    await hr.save();

    res.json({
      message: "HR updated successfully",
      HR: {
        id: hr._id,
        username: hr.username,
        email: hr.email,
        mobileno: hr.mobileno,
        role: hr.role,
        designation: hr.designation
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating HR",
      error: error.message,
    });
  }
};

// ✅ Delete HR
const deleteHR = async (req, res) => {
  try {
    const hr = await HR.findById(req.params.id);
    
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    await HR.findByIdAndDelete(req.params.id);

    res.json({
      message: "HR deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting HR",
      error: error.message,
    });
  }
};

module.exports = { registerHR, loginHR, getAllHR, getHRById, updateHR, deleteHR };