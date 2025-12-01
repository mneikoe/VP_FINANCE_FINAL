const suspectModel = require("../Models/SusProsClientSchema");
const generateAndStoreGroupCode = require("../utils/generateGroupCode");

// Create a new suspect
exports.createSuspect = async (req, res) => {
  try {
    // Check if request body has data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(401).json({
        error: "No Suspect data provided in request body",
      });
    }

    const suspectData = { ...req.body, status: "suspect" };
    const newSuspect = new suspectModel(suspectData);
    const savedSuspect = await newSuspect.save();

    if (!savedSuspect || !savedSuspect._id) {
      return res.status(500).json({
        error: "Failed to save Suspect data properly",
      });
    }

    const groupCode = await generateAndStoreGroupCode(savedSuspect._id);
    if (!savedSuspect.personalDetails) {
      savedSuspect.personalDetails = {};
    }
    savedSuspect.personalDetails.groupCode = groupCode;
    await savedSuspect.save();

    res.status(201).json(savedSuspect);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create Suspect form",
      details: err.message,
    });
  }
};

// Get all suspects
exports.getAllSuspects = async (req, res) => {
  try {
    const allSuspects = await suspectModel
      .find({ status: "suspect" })
      .sort({ createdAt: -1 });
    if (allSuspects.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No Suspects found" });
    res.status(200).json({ success: true, suspects: allSuspects });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching Suspects",
      error: error.message,
    });
  }
};

//!SECTIONfetch all appointment done
exports.getAllSuspectsAppointmentDone = async (req, res) => {
  try {
    const allSuspects = await suspectModel.find({
      status: "suspect",
      "callTasks.taskStatus": "Appointment Done",
    });
    if (allSuspects.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No Suspects found" });
    res.status(200).json({ success: true, suspects: allSuspects });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching Suspects",
      error: error.message,
    });
  }
};

// Get a single suspect by ID
exports.getSuspectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Suspect ID is required" });
    }
    const suspect = await suspectModel.findById(id);
    if (!suspect) {
      return res
        .status(404)
        .json({ success: false, message: "Suspect not found" });
    }
    res.status(200).json({ success: true, suspect });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching suspects",
      error: error.message,
    });
  }
};

// Update a suspect's personal details
exports.updatePersonalDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if the client ID is provided in the URL.
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Suspect ID is required." });
    }

    // 2. Validate that the request body contains the new personalDetails.
    const { personalDetails } = req.body;
    if (!personalDetails || Object.keys(personalDetails).length === 0) {
      return res.status(400).json({
        success: false,
        message: "New personal details are required in the request body.",
      });
    }

    // 3. Find the client by ID and update the personalDetails object.
    // The '$set' operator is used here to replace the entire 'personalDetails' object.
    const updatedSuspect = await suspectModel.findByIdAndUpdate(
      id,
      { $set: { personalDetails } },
      { new: true, runValidators: true } // Return the updated document and run schema validators.
    );

    // 4. Handle the case where the client ID is not found.
    if (!updatedSuspect) {
      return res
        .status(404)
        .json({ success: false, message: "Suspect not found." });
    }

    // 5. Send a successful response with the updated client document.
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedSuspect: updatedSuspect,
    });
  } catch (error) {
    // 6. Centralized error handling.
    console.error("Error updating personal details:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      details: error.message,
    });
  }
};

// Backend में addCallTask function - CORRECT VERSION
exports.addCallTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      taskDate,
      taskTime,
      taskRemarks,
      taskStatus,
      nextFollowUpDate, // ✅ YEH USE KARO (frontend se yahi aata hai)
      nextFollowUpTime, // ✅ YEH USE KARO
      nextAppointmentDate,
      nextAppointmentTime,
    } = req.body;

    console.log("🟢 BACKEND - ADD CALL TASK RECEIVED:", {
      suspectId: id,
      taskStatus,
      nextFollowUpDate, // ✅ Check if this exists
      nextFollowUpTime, // ✅ Check if this exists
      nextAppointmentDate,
      nextAppointmentTime,
    });

    // Validation
    if (!taskDate || !taskStatus) {
      return res.status(400).json({
        success: false,
        message: "Task date and status are required.",
      });
    }

    // Special validation for forwarded statuses
    const forwardedStatuses = [
      "Call Not Picked",
      "Busy on Another Call",
      "Call After Sometimes",
      "Others",
    ];
    if (
      forwardedStatuses.includes(taskStatus) &&
      (!nextFollowUpDate || !nextFollowUpTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Next call date and time are required for forwarded calls.",
      });
    }

    // Special validation for Appointment Done
    if (
      taskStatus === "Appointment Done" &&
      (!nextAppointmentDate || !nextAppointmentTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Next appointment date and time are required for Appointment Done status.",
      });
    }

    const suspect = await suspectModel.findById(id);
    if (!suspect) {
      return res.status(404).json({
        success: false,
        message: "Suspect not found.",
      });
    }

    // Determine category
    let taskCategory = "active";
    if (
      [
        "Not Reachable",
        "Wrong Number",
        "Not Interested",
        "Appointment Done",
      ].includes(taskStatus)
    ) {
      taskCategory = "closed";
    } else if (forwardedStatuses.includes(taskStatus)) {
      taskCategory = "forwarded";
    }

    // ✅ CORRECTED: Use nextFollowUpDate (jo frontend se aata hai)
    const newCallTask = {
      taskDate: new Date(taskDate),
      taskTime:
        taskTime ||
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      taskRemarks: taskRemarks || "",
      taskStatus,
      taskCategory,

      // ✅ FOR FORWARDED: Use nextFollowUpDate (frontend se yahi aata hai)
      nextFollowUpDate:
        forwardedStatuses.includes(taskStatus) && nextFollowUpDate
          ? new Date(nextFollowUpDate)
          : null,

      nextFollowUpTime:
        forwardedStatuses.includes(taskStatus) && nextFollowUpTime
          ? nextFollowUpTime
          : null,

      // ✅ FOR APPOINTMENT DONE
      nextAppointmentDate:
        taskStatus === "Appointment Done" && nextAppointmentDate
          ? new Date(nextAppointmentDate)
          : null,

      nextAppointmentTime:
        taskStatus === "Appointment Done" && nextAppointmentTime
          ? nextAppointmentTime
          : null,
    };

    console.log("💾 SAVING CALL TASK:", newCallTask);

    // Add to callTasks array
    suspect.callTasks.push(newCallTask);
    await suspect.save();

    res.status(200).json({
      success: true,
      message: "Call task added successfully.",
      callTask: newCallTask,
      totalCallTasks: suspect.callTasks.length,
    });
  } catch (error) {
    console.error("❌ Error adding call task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding call task.",
      details: error.message,
    });
  }
};
exports.getSuspectsByCallStatus = async (req, res) => {
  try {
    const { status, category, telecallerId } = req.query;

    console.log("🔍 Filtering suspects by:", {
      status,
      category,
      telecallerId,
    });

    // ✅ BASE QUERY - Only suspects assigned to specific telecaller
    let query = { status: "suspect" };

    if (telecallerId) {
      query.assignedTo = telecallerId;
    }

    const suspects = await suspectModel
      .find(query)
      .select("personalDetails callTasks assignedTo assignedAt status")
      .populate("assignedTo", "username email")
      .sort({ assignedAt: -1 });

    // ✅ FILTER BY LATEST CALL TASK STATUS
    const filteredSuspects = suspects.filter((suspect) => {
      if (!suspect.callTasks || suspect.callTasks.length === 0) {
        return status === "Not Contacted"; // No call tasks = Not Contacted
      }

      // Get latest call task
      const latestTask = suspect.callTasks.reduce((latest, task) => {
        if (!task.taskDate) return latest;
        const taskDate = new Date(task.taskDate);
        if (!latest) return task;
        const latestDate = new Date(latest.taskDate);
        return taskDate > latestDate ? task : latest;
      }, null);

      if (!latestTask) return false;

      // Filter by status
      if (status && latestTask.taskStatus !== status) {
        return false;
      }

      // Filter by category
      if (category && latestTask.taskCategory !== category) {
        return false;
      }

      return true;
    });

    console.log(
      `✅ Found ${filteredSuspects.length} suspects matching filters`
    );

    res.status(200).json({
      success: true,
      message: "Suspects filtered by call status",
      count: filteredSuspects.length,
      suspects: filteredSuspects,
      filters: { status, category, telecallerId },
    });
  } catch (error) {
    console.error("❌ Error filtering suspects:", error);
    res.status(500).json({
      success: false,
      message: "Server error while filtering suspects",
      error: error.message,
    });
  }
};
// Get call history for a suspect
exports.getCallHistory = async (req, res) => {
  try {
    const { id } = req.params; // Suspect ID

    const suspect = await suspectModel.findById(id, "callHistory");
    if (!suspect) {
      return res.status(404).json({
        success: false,
        message: "Suspect not found.",
      });
    }

    res.status(200).json({
      success: true,
      callHistory: suspect.callHistory,
    });
  } catch (error) {
    console.error("Error retrieving call history:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      details: error.message,
    });
  }
};

// Add family members to a suspect
exports.addFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide suspectId" });
    }
    const membersArray = req.body;
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of family members",
      });
    }
    const suspect = await suspectModel.findById(id);
    if (!suspect) {
      return res
        .status(404)
        .json({ success: false, message: "Suspect not found" });
    }
    suspect.familyMembers.push(...membersArray);
    await suspect.save();
    res.status(201).json({
      success: true,
      message: `${membersArray.length} family member(s) added successfully`,
      familyMembers: suspect.familyMembers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add family member(s)",
      error: error.message,
    });
  }
};

// Add financial info to a suspect

exports.addFinancialInfo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Suspect ID is required" });
    }

    // Find the client
    const suspect = await suspectModel.findById(id);
    if (!suspect) {
      return res
        .status(404)
        .json({ success: false, message: "Suspect not found" });
    }

    // console.log("Request body:", req.body);
    // console.log("Request files:", req.files);

    // Parse JSON strings if they exist, otherwise use empty arrays
    let insuranceData = [];
    let investmentsData = [];
    let loansData = [];

    try {
      // Handle both JSON strings and direct arrays
      if (req.body.insurance) {
        insuranceData =
          typeof req.body.insurance === "string"
            ? JSON.parse(req.body.insurance)
            : req.body.insurance;
      }

      if (req.body.investments) {
        investmentsData =
          typeof req.body.investments === "string"
            ? JSON.parse(req.body.investments)
            : req.body.investments;
      }

      if (req.body.loans) {
        loansData =
          typeof req.body.loans === "string"
            ? JSON.parse(req.body.loans)
            : req.body.loans;
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data format",
        error: parseError.message,
      });
    }

    // Ensure arrays are actually arrays
    insuranceData = Array.isArray(insuranceData) ? insuranceData : [];
    investmentsData = Array.isArray(investmentsData) ? investmentsData : [];
    loansData = Array.isArray(loansData) ? loansData : [];

    console.log("Parsed data:", { insuranceData, investmentsData, loansData });

    // Attach document filenames to each item if files exist
    // const attachFiles = (dataArray, uploadedFilesArray = []) => {
    //   if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
    //     dataArray.forEach((item, index) => {
    //       if (uploadedFilesArray[index]) {
    //         item.document = uploadedFilesArray[index].filename;
    //       }
    //     });
    //   }
    // };

    const attachFiles = (dataArray, uploadedFilesArray = []) => {
      if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
        dataArray.forEach((item, index) => {
          if (uploadedFilesArray[index]) {
            item.document = uploadedFilesArray[index].filename;
          } else {
            item.document = null;
          }
        });
      }
    };

    // Safely access file arrays
    const insuranceFiles = req.files?.insuranceDocuments || [];
    const investmentFiles = req.files?.investmentDocuments || [];
    const loanFiles = req.files?.loanDocuments || [];

    attachFiles(insuranceData, insuranceFiles);
    attachFiles(investmentsData, investmentFiles);
    attachFiles(loansData, loanFiles);

    // Initialize financialInfo if not present
    if (!suspect.financialInfo) {
      suspect.financialInfo = {
        insurance: [],
        investments: [],
        loans: [],
      };
    }

    // Append new data (only if arrays have content)
    if (insuranceData.length > 0) {
      suspect.financialInfo.insurance.push(...insuranceData);
    }
    if (investmentsData.length > 0) {
      suspect.financialInfo.investments.push(...investmentsData);
    }
    if (loansData.length > 0) {
      suspect.financialInfo.loans.push(...loansData);
    }

    // Check if any data was actually added
    const totalItemsAdded =
      insuranceData.length + investmentsData.length + loansData.length;
    if (totalItemsAdded === 0) {
      return res.status(400).json({
        success: false,
        message: "No financial data provided",
      });
    }

    // Save client
    await suspect.save();

    return res.status(200).json({
      success: true,
      message: "Financial info with documents added successfully",
      financialInfo: suspect.financialInfo,
      suspectId: suspect._id,
      added: {
        insurance: insuranceData.length,
        investments: investmentsData.length,
        loans: loansData.length,
      },
    });
  } catch (error) {
    console.error("Error in addFinancialInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add future priorities and needs to a suspect
exports.addFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const suspectId = req.params.id;
    const { futurePriorities, needs } = req.body;

    // Validate client ID
    if (!suspectId) {
      return res.status(400).json({ error: "suspect ID is required" });
    }

    // Validate futurePriorities
    if (!Array.isArray(futurePriorities)) {
      return res
        .status(400)
        .json({ error: "futurePriorities must be an array" });
    }

    for (const priority of futurePriorities) {
      if (
        !priority.priorityName ||
        !Array.isArray(priority.members) ||
        typeof priority.approxAmount !== "number" ||
        !priority.duration
      ) {
        return res
          .status(400)
          .json({ error: "Invalid priority object structure" });
      }
    }

    // Build update object
    const updateData = {
      futurePriorities,
    };

    if (needs && typeof needs === "object") {
      updateData.needs = needs;
    }

    const updatedSuspect = await suspectModel.findByIdAndUpdate(
      suspectId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSuspect) {
      return res.status(404).json({ error: "Suspect not found" });
    }

    res.status(200).json({
      message: "Future priorities (and needs if provided) updated successfully",
      suspect: updatedSuspect,
      suspectId: updatedSuspect._id,
    });
  } catch (error) {
    console.error("Error updating future priorities and needs:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Add a proposed financial plan to a suspect
exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate client ID
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Suspect ID is required" });
    }

    // Validate request body
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Request body is required" });
    }

    // Handle file uploads
    const files = req.files;
    if (!files) {
      return res.status(401).json({
        success: false,
        message: "Please provide documents to upload",
      });
    }

    const documentPaths = files.map((file) => file.filename);

    const suspectToUpdate = await suspectModel.findById(id);
    if (!suspectToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "suspect not found" });
    }

    const newProposedPlan = {
      ...req.body,
      documents: documentPaths,
    };

    suspectToUpdate.proposedPlan.push(newProposedPlan);

    await suspectToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Proposed financial plan updated successfully",
      proposedPlan: suspectToUpdate.proposedPlan,
      suspectId: suspectToUpdate._id,
    });
  } catch (error) {
    console.error("Error adding proposed financial plan:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Update a suspect's status
exports.updateSuspectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Suspect ID is required" });
    const updatedSuspect = await suspectModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedSuspect) {
      return res.status(404).json({ message: "Suspect not found" });
    }
    res.status(200).json(updatedSuspect);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a suspect
exports.deleteSuspect = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Suspect ID is required" });
    }

    await suspectModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "suspect deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting suspect",
      error: error.message,
    });
  }
};

// get all family members
exports.getAllFamilyMembers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide Client ID",
      });
    }

    const suspect = await suspectModel.findById(id).select("familyMembers");

    if (!suspect) {
      return res.status(404).json({
        success: false,
        message: "Suspect not found for this ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Family members fetched successfully",
      data: suspect.familyMembers,
    });
  } catch (error) {
    console.error("Error in fetching all family members:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching family members",
    });
  }
};
