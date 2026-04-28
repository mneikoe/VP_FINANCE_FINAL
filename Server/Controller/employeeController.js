const bcrypt = require("bcryptjs");
const employeeModel = require("../Models/employeeModel");
const mongoose = require("mongoose");
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
    } else if (newEmployee.role === "OA") {
      await autoSaveToOA(newEmployee);
    }
    // ✅ Yahan aage aur roles add kar sakte ho: Telemarketer, OE, RM

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

// ✅ OA AUTO-SAVE FUNCTION
const autoSaveToOA = async (employee) => {
  try {
    console.log(`🔄 AUTO-SAVE OA: Starting for ${employee.name}`);

    const OA = require("../Models/OAModel");

    const existingOA = await OA.findOne({
      $or: [{ email: employee.emailId }, { employeeRef: employee._id }],
    });

    if (!existingOA) {
      const oaData = {
        // Basic info
        username: employee.name,
        email: employee.emailId,
        mobileno: employee.mobileNo,
        password: employee.password,
        role: "OA",
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
        panNo: employee.panNo,
        aadharNo: employee.aadharNo,
      };

      const newOA = new OA(oaData);
      await newOA.save();

      console.log(`✅ OA AUTO-SAVE SUCCESS for ${employee.name}`);
    } else {
      console.log(`ℹ️ OA already exists for: ${employee.name}`);
    }
  } catch (autoSaveError) {
    console.log(`❌ OA AUTO-SAVE ERROR: ${autoSaveError.message}`);
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
// employeeController.js mein ye function add karo

// Get clients/prospects by employee's work area
exports.getClientsByEmployeeArea = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Step 1: Find employee details
    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Step 2: Get employee's work area and subarea
    const workArea = employee.workArea;
    const workSubArea = employee.workSubArea;

    if (!workArea) {
      return res.status(400).json({
        success: false,
        message: "Employee does not have a work area assigned",
      });
    }

    // Step 3: Fetch TestSchema model
    const TestModel = require("../Models/SusProsClientSchema");

    // Step 4: Build filter based on employee's area
    let areaFilter = {};

    if (workArea) {
      areaFilter["personalDetails.preferredMeetingArea"] = workArea;
    }

    if (workSubArea && workSubArea !== "") {
      areaFilter["personalDetails.subArea"] = workSubArea;
    }

    // Step 5: Find clients/prospects in that area
    const clients = await TestModel.find(areaFilter)
      .select("status personalDetails assignedToRM assignedToRMName")
      .populate("assignedToRM", "name employeeCode")
      .sort({ createdAt: -1 });

    // Step 6: Format response
    const formattedClients = clients.map((client) => ({
      _id: client._id,
      status: client.status,
      name: client.personalDetails?.name || "N/A",
      mobileNo: client.personalDetails?.mobileNo || "N/A",
      preferredMeetingArea:
        client.personalDetails?.preferredMeetingArea || "N/A",
      subArea: client.personalDetails?.subArea || "N/A",
      city: client.personalDetails?.city || "N/A",
      assignedToRMName: client.assignedToRMName || "Not Assigned",
      assignedToRMCode: client.assignedToRM?.employeeCode || "N/A",
    }));

    // Step 7: Calculate stats
    const stats = {
      total: clients.length,
      suspects: clients.filter((c) => c.status === "suspect").length,
      prospects: clients.filter((c) => c.status === "prospect").length,
      clients: clients.filter((c) => c.status === "client").length,
      employeeArea: workArea,
      employeeSubArea: workSubArea || "Not specified",
    };

    res.status(200).json({
      success: true,
      message: "Clients fetched by employee area successfully",
      data: {
        employee: {
          name: employee.name,
          employeeCode: employee.employeeCode,
          role: employee.role,
          workArea: workArea,
          workSubArea: workSubArea || "Not specified",
          workCity: employee.workCity,
        },
        stats: stats,
        clients: formattedClients,
        count: clients.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching clients by employee area:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clients by employee area",
      error: error.message,
    });
  }
};

// NEW: Get clients by area/subarea (for any user)
exports.getClientsByArea = async (req, res) => {
  try {
    const { area, subArea, status } = req.query;

    let filter = {};

    if (area && area !== "") {
      filter["personalDetails.preferredMeetingArea"] = area;
    }

    if (subArea && subArea !== "") {
      filter["personalDetails.subArea"] = subArea;
    }

    if (status && status !== "") {
      filter.status = status;
    }

    const TestModel = require("../Models/SusProsClientSchema");
    const clients = await TestModel.find(filter)
      .select("status personalDetails")
      .sort({ createdAt: -1 });

    const formattedClients = clients.map((client) => ({
      _id: client._id,
      status: client.status,
      name: client.personalDetails?.name || "N/A",
      mobileNo: client.personalDetails?.mobileNo || "N/A",
      emailId: client.personalDetails?.emailId || "N/A",
      area: client.personalDetails?.preferredMeetingArea || "N/A",
      subArea: client.personalDetails?.subArea || "N/A",
      city: client.personalDetails?.city || "N/A",
      groupCode: client.personalDetails?.groupCode || "N/A",
      organisation: client.personalDetails?.organisation || "N/A",
    }));

    res.status(200).json({
      success: true,
      message: "Clients fetched by area successfully",
      data: formattedClients,
      count: clients.length,
    });
  } catch (error) {
    console.error("❌ Error fetching clients by area:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clients by area",
      error: error.message,
    });
  }
};
exports.getClientsByAllocatedRM = async (req, res) => {
  try {
    const { allocatedRM } = req.query;

    console.log("🔍 [API] Received allocatedRM:", allocatedRM);

    // Step 1: Find RM
    const employeeModel = require("../Models/employeeModel");
    const TestModel = require("../Models/SusProsClientSchema");

    let rmFilter = {};

    // Agar ObjectId format mein hai
    if (mongoose.Types.ObjectId.isValid(allocatedRM.trim())) {
      rmFilter._id = allocatedRM.trim();
    } else {
      // Agar name ya code search kar rahe ho
      rmFilter.$or = [
        { name: { $regex: allocatedRM.trim(), $options: "i" } },
        { employeeCode: { $regex: allocatedRM.trim(), $options: "i" } },
      ];
    }

    rmFilter.role = "RM";

    const rm = await employeeModel
      .findOne(rmFilter)
      .select("_id name employeeCode");

    if (!rm) {
      console.log(`❌ RM not found: ${allocatedRM}`);
      return res.status(200).json({
        success: true,
        message: `RM "${allocatedRM}" not found`,
        data: { clients: [], count: 0 },
      });
    }

    console.log(`✅ Found RM: ${rm.name} (${rm.employeeCode})`);

    // ✅ STEP 2: CORRECT FILTER - Search inside personalDetails
    const filter = {
      "personalDetails.allocatedRM": rm._id.toString(),
      status: { $in: ["client", "prospect"] },
    };

    console.log("📋 Correct filter:", JSON.stringify(filter));

    // Step 3: Execute query
    const clients = await TestModel.find(filter).sort({ createdAt: -1 });

    console.log(`📊 Found ${clients.length} clients/prospects`);

    // Step 4: Format response
    const formattedClients = clients.map((client) => ({
      _id: client._id,
      status: client.status,
      name: client.personalDetails?.name || "N/A",
      mobileNo: client.personalDetails?.mobileNo || "N/A",
      emailId: client.personalDetails?.emailId || "N/A",
      area: client.personalDetails?.preferredMeetingArea || "N/A",
      subArea: client.personalDetails?.subArea || "N/A",
      city: client.personalDetails?.city || "N/A",
      groupCode: client.personalDetails?.groupCode || "N/A",
      allocatedRM: client.personalDetails?.allocatedRM || "N/A",
    }));

    res.status(200).json({
      success: true,
      message: `Found ${formattedClients.length} clients/prospects for RM ${rm.name}`,
      data: {
        rm: {
          id: rm._id,
          name: rm.name,
          employeeCode: rm.employeeCode,
        },
        clients: formattedClients,
        count: formattedClients.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching clients by RM:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clients by RM",
      error: error.message,
    });
  }
};

// ✅ Upload Employee Document (Job Profile / Target)
exports.uploadEmployeeDocument = async (req, res) => {
  try {
    const { employeeId, role, documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!employeeId || !role || !documentType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let Model;
    const roleLower = role.toLowerCase();

    if (roleLower === "hr") {
      Model = require("../Models/HRModel");
    } else if (roleLower === "telecaller") {
      Model = require("../Models/telecallerModel");
    } else if (roleLower === "oa") {
      Model = require("../Models/OAModel");
    } else {
      Model = require("../Models/employeeModel");
    }

    const updateData = {};
    const filePath = `/uploads/${file.filename}`; // Using /uploads as it's already configured in index.js
    
    if (documentType === "jobProfile") {
      updateData.jobProfile = {
        path: filePath,
        uploadDate: new Date()
      };
    } else if (documentType === "target") {
      updateData.target = {
        path: filePath,
        uploadDate: new Date()
      };
    } else {
      return res.status(400).json({ success: false, message: "Invalid document type" });
    }

    const updatedEmployee = await Model.findByIdAndUpdate(employeeId, updateData, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Also sync to employeeModel if it's not the primary model (for consistency)
    if (Model !== require("../Models/employeeModel") && updatedEmployee.employeeRef) {
      await require("../Models/employeeModel").findByIdAndUpdate(updatedEmployee.employeeRef, updateData);
    }

    res.status(200).json({
      success: true,
      message: `${documentType === "jobProfile" ? "Job Profile" : "Target"} uploaded successfully`,
      data: updatedEmployee
    });
  } catch (error) {
    console.error("❌ Error uploading document:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading document",
      error: error.message
    });
  }
};
