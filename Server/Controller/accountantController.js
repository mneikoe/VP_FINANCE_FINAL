const Accountant = require("../Models/accountantModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Accountant
const registerAccountant = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check existing
    const existingUser = await Accountant.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const accountant = new Accountant({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "Accountant",
    });

    await accountant.save();

    res.status(201).json({
      message: "Accountant registered successfully",
      accountant: {
        id: accountant._id,
        username: accountant.username,
        email: accountant.email,
        mobileno: accountant.mobileno,
        role: accountant.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering Accountant",
      error: error.message,
    });
  }
};

// ✅ Login Accountant
const loginAccountant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const accountant = await Accountant.findOne({ email });
    if (!accountant) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, accountant.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: accountant._id, role: accountant.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      accountant: {
        id: accountant._id,
        username: accountant.username,
        email: accountant.email,
        mobileno: accountant.mobileno,
        role: accountant.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerAccountant, loginAccountant };