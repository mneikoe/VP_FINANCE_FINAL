const CRE = require("../Models/CREModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerCRE = async (req, res) => {
  try {
    console.log(req.body);
    console.log("CRE controller call");

    const { name, PersonalEmail, PasswordForlogin, personalMobile } = req.body;

    // Check if CRE already exists
    const existingUser = await CRE.findOne({ email: PersonalEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log(existingUser);

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PasswordForlogin, salt);

    const newCRE = new CRE({
      username: name,
      email: PersonalEmail,
      mobileno: personalMobile,
      password: hashedPassword,
      role: "CRE", // Fix CRE role
    });

    console.log(newCRE);

    await newCRE.save();

    console.log("LKJHGFDSA", newCRE),
      res.status(201).json({
        message: "CRE registered successfully",
        CRE: {
          id: newCRE._id,
          username: newCRE.username,
          email: newCRE.email,
          mobileno: newCRE.mobileno,
          role: newCRE.role,
        },
      });
  } catch (error) {
    res.status(500).json({
      message: "Error registering CRE",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginCRE = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cre = await CRE.findOne({ email });
    if (!cre) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, cre.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: cre._id, role: cre.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      CRE: {
        id: cre._id,
        username: cre.username,
        email: cre.email,
        mobileno: cre.mobileno,
        role: cre.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerCRE, loginCRE };
