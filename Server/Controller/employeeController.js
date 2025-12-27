const bcrypt = require("bcryptjs");
const employeeModel = require("../Models/employeeModel");

exports.addEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    console.log("📥 Fetch data from frontend", employeeData);

    // Validate required fields
    if (
      !employeeData.name ||
      !employeeData.emailId ||
      !employeeData.role ||
      !employeeData.mobileNo
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Role and Mobile Number are required",
      });
    }

    // Check if email already exists
    const existingEmail = await employeeModel.findOne({
      emailId: employeeData.emailId,
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Check if employee code already exists
    if (employeeData.employeeCode) {
      const existingCode = await employeeModel.findOne({
        employeeCode: employeeData.employeeCode,
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Employee with this code already exists",
        });
      }
    }

    // ✅ MANUAL PASSWORD HASHING
    console.log("🔑 Manual password hashing...");
    const salt = await bcrypt.genSalt(10);
    employeeData.password = await bcrypt.hash(
      employeeData.password || "123456",
      salt
    );
    console.log("✅ Password manually hashed:", employeeData.password);

    // Create new employee
    const newEmployee = new employeeModel(employeeData);
    await newEmployee.save();

    console.log("✅ Employee added successfully:", {
      name: newEmployee.name,
      email: newEmployee.emailId,
      employeeCode: newEmployee.employeeCode,
      role: newEmployee.role,
      password: newEmployee.password,
    });

    // ✅ AUTO-SAVE TO ROLE-SPECIFIC MODELS
    if (newEmployee.role === "Telecaller") {
      await autoSaveToTelecaller(newEmployee);
    } else if (newEmployee.role === "HR") {
      await autoSaveToHR(newEmployee);
    }
    // ✅ Yahan aage aur roles add kar sakte ho: Telemarketer, OE, RM, OA

    // ✅ IMMEDIATE LOGIN TEST
    const testMatch = await bcrypt.compare("123456", newEmployee.password);
    console.log("🧪 IMMEDIATE PASSWORD TEST:", testMatch);

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      data: {
        _id: newEmployee._id,
        name: newEmployee.name,
        emailId: newEmployee.emailId,
        employeeCode: newEmployee.employeeCode,
        role: newEmployee.role,
        mobileNo: newEmployee.mobileNo,
        designation: newEmployee.designation,
      },
      loginTest: {
        success: testMatch,
        message: testMatch ? "Login should work ✅" : "Login will fail ❌",
      },
    });
  } catch (error) {
    console.error("❌ Error adding employee:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = `Employee with this ${field} already exists`;
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding employee",
      error: error.message,
    });
  }
};

// ✅ TELEcallER AUTO-SAVE FUNCTION
const autoSaveToTelecaller = async (employee) => {
  try {
    console.log(`🔄 AUTO-SAVE TELEcallER: Starting for ${employee.name}`);

    const Telecaller = require("../Models/telecallerModel");

    const existingTelecaller = await Telecaller.findOne({
      $or: [{ email: employee.emailId }, { employeeRef: employee._id }],
    });

    if (!existingTelecaller) {
      const telecallerData = {
        // Basic info
        username: employee.name,
        email: employee.emailId,
        mobileno: employee.mobileNo,
        password: employee.password,
        role: "Telecaller",
        employeeRef: employee._id,

        // Complete employee data
        employeeCode: employee.employeeCode,
        designation: employee.designation,
        gender: employee.gender,
        dob: employee.dob,
        marriageDate: employee.marriageDate,
        presentAddress: employee.presentAddress,
        permanentAddress: employee.permanentAddress,
        homeTown: employee.homeTown,
        familyContactPerson: employee.familyContactPerson,
        familyContactMobile: employee.familyContactMobile,
        emergencyContactPerson: employee.emergencyContactPerson,
        emergencyContactMobile: employee.emergencyContactMobile,
        officeMobile: employee.officeMobile,
        officeEmail: employee.officeEmail,
        allottedLoginId: employee.allottedLoginId,
        allocatedWorkArea: employee.allocatedWorkArea,
        dateOfJoining: employee.dateOfJoining,
        dateOfTermination: employee.dateOfTermination,
        salaryOnJoining: employee.salaryOnJoining,
        expenses: employee.expenses,
        incentives: employee.incentives,
        bankName: employee.bankName,
        accountNo: employee.accountNo,
        ifscCode: employee.ifscCode,
        micr: employee.micr,
        officeKit: employee.officeKit,
        offerLetter: employee.offerLetter,
        undertaking: employee.undertaking,
        trackRecord: employee.trackRecord,
        drawerKeyName: employee.drawerKeyName,
        drawerKeyNumber: employee.drawerKeyNumber,
        officeKey: employee.officeKey,
        onFirstJoining: employee.onFirstJoining,
        onSixMonthCompletion: employee.onSixMonthCompletion,
        onTwelveMonthCompletion: employee.onTwelveMonthCompletion,
        panNo: employee.panNo,
        aadharNo: employee.aadharNo,

        // Telecaller specific
        assignedSuspects: [],
      };

      const newTelecaller = new Telecaller(telecallerData);
      await newTelecaller.save();

      console.log(`✅ TELEcallER AUTO-SAVE SUCCESS for ${employee.name}`);
    } else {
      console.log(`ℹ️ Telecaller already exists for: ${employee.name}`);
    }
  } catch (autoSaveError) {
    console.log(`❌ TELEcallER AUTO-SAVE ERROR: ${autoSaveError.message}`);
  }
};

// ✅ HR AUTO-SAVE FUNCTION
const autoSaveToHR = async (employee) => {
  try {
    console.log(`🔄 AUTO-SAVE HR: Starting for ${employee.name}`);

    const HR = require("../Models/HRModel");

    const existingHR = await HR.findOne({
      $or: [{ email: employee.emailId }, { employeeRef: employee._id }],
    });

    if (!existingHR) {
      const hrData = {
        // Basic info
        username: employee.name,
        email: employee.emailId,
        mobileno: employee.mobileNo,
        password: employee.password,
        role: "HR",
        employeeRef: employee._id,

        // Complete employee data
        employeeCode: employee.employeeCode,
        designation: employee.designation,
        gender: employee.gender,
        dob: employee.dob,
        marriageDate: employee.marriageDate,
        presentAddress: employee.presentAddress,
        permanentAddress: employee.permanentAddress,
        homeTown: employee.homeTown,
        familyContactPerson: employee.familyContactPerson,
        familyContactMobile: employee.familyContactMobile,
        emergencyContactPerson: employee.emergencyContactPerson,
        emergencyContactMobile: employee.emergencyContactMobile,
        officeMobile: employee.officeMobile,
        officeEmail: employee.officeEmail,
        allottedLoginId: employee.allottedLoginId,
        allocatedWorkArea: employee.allocatedWorkArea,
        dateOfJoining: employee.dateOfJoining,
        dateOfTermination: employee.dateOfTermination,
        salaryOnJoining: employee.salaryOnJoining,
        expenses: employee.expenses,
        incentives: employee.incentives,
        bankName: employee.bankName,
        accountNo: employee.accountNo,
        ifscCode: employee.ifscCode,
        micr: employee.micr,
        officeKit: employee.officeKit,
        offerLetter: employee.offerLetter,
        undertaking: employee.undertaking,
        trackRecord: employee.trackRecord,
        drawerKeyName: employee.drawerKeyName,
        drawerKeyNumber: employee.drawerKeyNumber,
        officeKey: employee.officeKey,
        onFirstJoining: employee.onFirstJoining,
        onSixMonthCompletion: employee.onSixMonthCompletion,
        onTwelveMonthCompletion: employee.onTwelveMonthCompletion,
        panNo: employee.panNo,
        aadharNo: employee.aadharNo,

        // ✅ Yahan HR specific fields add kar sakte ho jaise:
        // hrResponsibilities: [],
        // managedEmployees: [],
        // recruitmentStats: {}
      };

      const newHR = new HR(hrData);
      await newHR.save();

      console.log(`✅ HR AUTO-SAVE SUCCESS for ${employee.name}`);
    } else {
      console.log(`ℹ️ HR already exists for: ${employee.name}`);
    }
  } catch (autoSaveError) {
    console.log(`❌ HR AUTO-SAVE ERROR: ${autoSaveError.message}`);
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const updates = req.body;

    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const updatedEmployee = await employeeModel.findByIdAndUpdate(
      employeeId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res
        .status(400)
        .json({ success: false, message: "employeeId is required" });
    }

    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res
        .status(400)
        .json({ success: false, message: "employeeId is required" });
    }

    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    await employeeModel.findByIdAndDelete(employeeId);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { department, role, search } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await employeeModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalEmployees = await employeeModel.countDocuments(filter);
    const totalPages = Math.ceil(totalEmployees / limit);

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
      totalEmployees,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};
// Get last employee code for a role
exports.getLastEmployeeCode = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const roleCodes = {
      Telecaller: "TC",
      Telemarketer: "TM",
      OE: "OE",
      HR: "HR",
      RM: "RM",
    };

    const roleCode = roleCodes[role];

    // Find the last employee with this role code
    const lastEmployee = await employeeModel
      .find({ employeeCode: { $regex: `^${roleCode}` } })
      .sort({ employeeCode: -1 })
      .limit(1);

    let lastCode = null;
    if (lastEmployee.length > 0) {
      lastCode = lastEmployee[0].employeeCode;
    }

    res.status(200).json({
      success: true,
      message: "Last employee code fetched successfully",
      lastCode: lastCode,
      role: role,
      roleCode: roleCode,
    });
  } catch (error) {
    console.error("❌ Error getting last employee code:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching last employee code",
      error: error.message,
    });
  }
};
// ✅ NEW: Get all unique employee roles for tasks
exports.getEmployeeRoles = async (req, res) => {
  try {
    console.log("🔍 Fetching employee roles for tasks...");

    // Step 1: Employee मॉडल से सभी unique roles लाओ
    const rolesFromDB = await employeeModel.distinct("role", {
      role: { $ne: null, $ne: "" }, // Empty roles filter करो
    });

    console.log("📊 Roles from database:", rolesFromDB);

    // Step 3: Combine और remove duplicates
    const allRoles = [...new Set([...rolesFromDB])];

    // Step 4: Sort alphabetically
    const sortedRoles = allRoles.sort();

    console.log("✅ Final roles for tasks:", sortedRoles);

    res.status(200).json({
      success: true,
      message: "Employee roles fetched successfully",
      data: {
        roles: sortedRoles,
        count: sortedRoles.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching employee roles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee roles",
      error: error.message,
    });
  }
};
// employeeController.js - New function add karein
exports.getEmployeesByArea = async (req, res) => {
  try {
    const { area, pincode, role, subArea } = req.query;

    let filter = {};

    // Filter by area
    if (area) {
      filter.areaOfWork = area;
    }

    // Filter by pincode
    if (pincode) {
      filter.workPincode = pincode;
    }

    // Filter by role
    if (role) {
      filter.role = role;
    }

    // Filter by subArea
    if (subArea) {
      filter.workSubArea = subArea;
    }

    const employees = await employeeModel
      .find(filter)
      .select(
        "name employeeCode role mobileNo emailId areaOfWork workPincode workSubArea designation"
      )
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Employees fetched by area successfully",
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    console.error("❌ Error fetching employees by area:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employees by area",
      error: error.message,
    });
  }
};

// Get all unique areas from employees
exports.getEmployeeAreas = async (req, res) => {
  try {
    const areas = await employeeModel.distinct("areaOfWork", {
      areaOfWork: { $ne: null, $ne: "" },
    });

    // Also get pincodes
    const pincodes = await employeeModel.distinct("workPincode", {
      workPincode: { $ne: null, $ne: "" },
    });

    res.status(200).json({
      success: true,
      message: "Employee areas fetched successfully",
      data: {
        areas: areas.sort(),
        pincodes: pincodes.sort(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee areas",
      error: error.message,
    });
  }
};
