const express = require("express");
const { loginUser } = require("../Controller/authController");
const Employee = require("../Models/employeeModel");
const Telecaller = require("../Models/telecallerModel");
const Telemarketer = require("../Models/telemarketerModel");
const HR = require("../Models/HRModel");
const OA = require("../Models/OAModel");
const OE = require("../Models/OEModel");
const bcrypt=require("bcryptjs")

const router = express.Router();

// Common login route
router.post("/login", loginUser);

// ✅ TEST ROUTE - Check if user exists
router.get("/test-user-check", async (req, res) => {
  try {
    const { email, employeeCode } = req.query;
    
    console.log("🔍 TEST USER CHECK:", { email, employeeCode });

    let result = {};

    if (email) {
      // Check Employee model
      result.employee = await Employee.findOne({ emailId: email });
      
      // Check other models
      result.telecaller = await Telecaller.findOne({ email });
      result.telemarketer = await Telemarketer.findOne({ email });
      result.oe = await OE.findOne({ email });
      result.oa = await OA.findOne({ email });
      result.hr = await HR.findOne({ email });
    }

    if (employeeCode) {
      result.employeeByCode = await Employee.findOne({ employeeCode });
    }

    console.log("📊 TEST RESULTS:", {
      employeeFound: !!result.employee,
      telecallerFound: !!result.telecaller,
      telemarketerFound: !!result.telemarketer,
      oeFound: !!result.oe,
      oaFound: !!result.oa,
      hrFound: !!result.hr,
      employeeByCodeFound: !!result.employeeByCode
    });

    res.json({
      success: true,
      query: { email, employeeCode },
      results: result
    });

  } catch (error) {
    console.error("❌ TEST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Updated force fix route with detailed password debugging
router.post("/force-fix-password", async (req, res) => {
  try {
    const { email, employeeCode } = req.body;
    
    console.log("🛠️ FORCE FIXING PASSWORD FOR:", { email, employeeCode });

    let user = null;

    if (email) {
      user = await Employee.findOne({ emailId: email });
    } else if (employeeCode) {
      user = await Employee.findOne({ employeeCode });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("🔑 BEFORE FIX:");
    console.log("📧 User:", user.name);
    console.log("🎭 Role:", user.role);
    console.log("🔐 Current password:", user.password);
    console.log("✅ Is hashed?", user.password.startsWith('$2b$'));

    // ✅ ADD MISSING ROLE IF NOT PRESENT
    if (!user.role) {
      console.log("🔄 Adding missing role...");
      user.role = "Telecaller";
    }

    // Force reset password to "123456" and hash it
    console.log("🔄 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash("123456", salt);
    console.log("🔐 New hashed password:", newHashedPassword);
    
    user.password = newHashedPassword;
    await user.save();

    console.log("✅ AFTER FIX:");
    console.log("🎭 New role:", user.role);
    console.log("🔐 Stored password:", user.password);

    // ✅ DETAILED PASSWORD TESTING
    console.log("🧪 DETAILED PASSWORD TESTING:");
    console.log("📥 Input password: 123456");
    console.log("💾 Stored password:", user.password);
    
    const testMatch = await bcrypt.compare("123456", user.password);
    console.log("✅ Bcrypt compare result:", testMatch);
    
    // Test with the original hash we created
    const testMatch2 = await bcrypt.compare("123456", newHashedPassword);
    console.log("✅ Bcrypt compare with original hash:", testMatch2);

    // Reload user from database to confirm save
    const reloadedUser = await Employee.findOne({ emailId: email });
    console.log("🔄 Reloaded user password:", reloadedUser.password);
    const testMatch3 = await bcrypt.compare("123456", reloadedUser.password);
    console.log("✅ Bcrypt compare with reloaded user:", testMatch3);

    res.json({
      success: true,
      message: "Password forcefully fixed to 123456 and role added",
      user: {
        name: user.name,
        email: user.emailId,
        employeeCode: user.employeeCode,
        role: user.role,
        passwordFixed: true,
        testPasswordMatch: testMatch,
        testPasswordMatch2: testMatch2,
        testPasswordMatch3: testMatch3,
        storedPassword: user.password
      }
    });

  } catch (error) {
    console.error("❌ FORCE FIX PASSWORD ERROR:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
// Temporary route - Direct check
router.get("/direct-check", async (req, res) => {
  try {
    const user = await Employee.findOne({ emailId: "shivam7728081@gmail.com" });
    
    console.log("🔍 DIRECT CHECK:", user);
    
    if (user) {
      console.log("🔐 Password:", user.password);
      console.log("✅ Is hashed?", user.password.startsWith('$2b$'));
      
      // Test password
      const isMatch = await bcrypt.compare("123456", user.password);
      console.log("🧪 Password match:", isMatch);
    }
    
    res.json({ 
      userFound: !!user,
      user: user ? {
        name: user.name,
        email: user.emailId,
        employeeCode: user.employeeCode,
        password: user.password,
        isHashed: user.password.startsWith('$2b$')
      } : null
    });
  } catch (error) {
    console.error("❌ DIRECT CHECK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});
// Add this route to check user details
router.get("/check-user-details", async (req, res) => {
  try {
    const { email } = req.query;
    
    const user = await Employee.findOne({ emailId: email });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.emailId,
        employeeCode: user.employeeCode,
        role: user.role,
        password: user.password,
        isHashed: user.password.startsWith('$2b$'),
        hasRole: !!user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;