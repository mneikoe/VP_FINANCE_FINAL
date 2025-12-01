const Telemarketer = require("../Models/telemarketerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerTelemarketer = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if telemarketer already exists
    const existingUser = await Telemarketer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTelemarketer = new Telemarketer({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "Telemarketer", // fix role here
    });

    await newTelemarketer.save();

    res.status(201).json({
      message: "Telemarketer registered successfully",
      telemarketer: {
        id: newTelemarketer._id,
        username: newTelemarketer.username,
        email: newTelemarketer.email,
        mobileno: newTelemarketer.mobileno,
        role: newTelemarketer.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering Telemarketer",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginTelemarketer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const telemarketer = await Telemarketer.findOne({ email });
    if (!telemarketer) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, telemarketer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: telemarketer._id, role: telemarketer.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      telemarketer: {
        id: telemarketer._id,
        username: telemarketer.username,
        email: telemarketer.email,
        mobileno: telemarketer.mobileno,
        role: telemarketer.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerTelemarketer, loginTelemarketer };
