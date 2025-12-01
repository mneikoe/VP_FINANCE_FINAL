const Employee = require("../Models/employeeModel");
const Telecaller = require("../Models/telecallerModel");
const Telemarketer = require("../Models/telemarketerModel");
const HR = require("../Models/HRModel");
const OA = require("../Models/OAModel");
const OE = require("../Models/OEModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const { email, password, employeeCode } = req.body;

    console.log("🔐 LOGIN ATTEMPT:", { email, employeeCode });

    let user = null;
    let role = "";
    let userType = "";

    // OPTION 1: Login with Employee Code
    if (employeeCode) {
      console.log("🔍 Searching by employee code:", employeeCode);
      
      // Search in Employee model
      user = await Employee.findOne({ employeeCode });
      if (user) {
        role = user.role;
        userType = "Employee";
        console.log("✅ Employee found by code:", user.name);
      }
    } 
    // OPTION 2: Login with Email
    else if (email) {
      console.log("🔍 Searching by email:", email);
      
      // Search in all models by email
      
      // 1. First check Employee model
      user = await Employee.findOne({ emailId: email });
      if (user) {
        role = user.role;
        userType = "Employee";
        console.log("✅ Employee found by email:", user.name);
      }
      
      // 2. Check other roles if not found in Employee
      if (!user) {
        user = await Telecaller.findOne({ email });
        if (user) {
          role = "Telecaller";
          userType = "Telecaller";
          console.log("✅ Telecaller found:", user.username);
        }
      }

      if (!user) {
        user = await Telemarketer.findOne({ email });
        if (user) {
          role = "Telemarketer";
          userType = "Telemarketer";
          console.log("✅ Telemarketer found:", user.username);
        }
      }

      if (!user) {
        user = await OE.findOne({ email });
        if (user) {
          role = "OE";
          userType = "OE";
          console.log("✅ OE found:", user.username);
        }
      }

      if (!user) {
        user = await OA.findOne({ email });
        if (user) {
          role = "OA";
          userType = "OA";
          console.log("✅ OA found:", user.username);
        }
      }

      if (!user) {
        user = await HR.findOne({ email });
        if (user) {
          role = "HR";
          userType = "HR";
          console.log("✅ HR found:", user.username);
        }
      }
    }

    // Step 4: If user not found
    if (!user) {
      console.log("❌ User not found in any model");
      return res.status(400).json({ 
        success: false,
        message: "Invalid email/employee code or password" 
      });
    }

    // ✅ MANUAL PASSWORD COMPARE
    console.log("🔑 MANUAL PASSWORD COMPARE:");
    console.log("📥 Input password:", password);
    console.log("💾 Stored password:", user.password);
    console.log("🔐 Is password hashed?", user.password.startsWith('$2b$'));
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("✅ PASSWORD MATCH RESULT:", isMatch);
    
    if (!isMatch) {
      console.log("❌ PASSWORD MISMATCH");
      return res.status(400).json({ 
        success: false,
        message: "Invalid email/employee code or password" 
      });
    }

    // Step 6: Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: role,
        userType: userType
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("🎉 LOGIN SUCCESSFUL:", {
      name: user.name || user.username,
      role: role,
      userType: userType
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username || user.name,
        email: user.email || user.emailId,
        mobileno: user.mobileno || user.mobileNo,
        role: role,
        employeeCode: user.employeeCode || null,
        userType: userType
      },
    });
  } catch (error) {
    console.error("💥 LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { loginUser };