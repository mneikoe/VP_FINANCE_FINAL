const OE = require("../Models/OEModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerOE = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if OE already exists
    const existingUser = await OE.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOE = new OE({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "OE", // fix role
    });

    await newOE.save();

    res.status(201).json({
      message: "OE registered successfully",
      OE: {
        id: newOE._id,
        username: newOE.username,
        email: newOE.email,
        mobileno: newOE.mobileno,
        role: newOE.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering OE",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginOE = async (req, res) => {
  try {
    const { email, password } = req.body;

    const oe = await OE.findOne({ email });
    if (!oe) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, oe.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: oe._id, role: oe.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      OE: {
        id: oe._id,
        username: oe.username,
        email: oe.email,
        mobileno: oe.mobileno,
        role: oe.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerOE, loginOE };
