const OA = require("../Models/OAModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerOA = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if OA already exists
    const existingUser = await OA.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOA = new OA({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "OA", // Fix OA role
    });

    await newOA.save();

    res.status(201).json({
      message: "OA registered successfully",
      OA: {
        id: newOA._id,
        username: newOA.username,
        email: newOA.email,
        mobileno: newOA.mobileno,
        role: newOA.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering OA",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginOA = async (req, res) => {
  try {
    const { email, password } = req.body;

    const oa = await OA.findOne({ email });
    if (!oa) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, oa.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: oa._id, role: oa.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      OA: {
        id: oa._id,
        username: oa.username,
        email: oa.email,
        mobileno: oa.mobileno,
        role: oa.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerOA, loginOA };
