const TestSchema = require("../Models/SusProsClientSchema");
const Employee = require("../Models/employeeModel");
const RMAssignment = require("../Models/RMAssignment");
const mongoose = require("mongoose");

// ✅ Get all RMs
exports.getAllRMs = async (req, res) => {
  try {
    console.log("📋 Fetching all Relationship Managers...");

    const rms = await Employee.find({ role: "RM" })
      .select("_id name employeeCode emailId mobileNo designation")
      .sort({ name: 1 });

    console.log(`✅ Found ${rms.length} RMs`);

    res.status(200).json({
      success: true,
      count: rms.length,
      data: rms.map((rm) => ({
        id: rm._id,
        name: rm.name,
        employeeCode: rm.employeeCode,
        email: rm.emailId,
        mobileNo: rm.mobileNo,
        designation: rm.designation || "Relationship Manager",
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching RMs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Relationship Managers",
      error: error.message,
    });
  }
};

// ✅ Get prospects for assignment (for prospects tab)
exports.getProspectsForAssignment = async (req, res) => {
  try {
    console.log("🔍 Fetching prospects for RM assignment...");

    // Find prospects with appointment scheduled
    const prospects = await TestSchema.find({
      status: "prospect",
      "callTasks.taskStatus": "Appointment Scheduled",
    })
      .select("_id groupCode personalDetails callTasks createdAt status")
      .sort({ createdAt: -1 });

    // Get already assigned prospect IDs from RMAssignment collection ONLY
    const assignedProspectIds = await RMAssignment.distinct("prospectId");

    console.log(`📊 Total prospects: ${prospects.length}`);
    console.log(
      `📊 Already assigned in RMAssignment: ${assignedProspectIds.length}`
    );

    // Filter only unassigned prospects
    const unassignedProspects = prospects.filter(
      (prospect) => !assignedProspectIds.includes(prospect._id.toString())
    );

    // Format response
    const formattedProspects = unassignedProspects.map((prospect) => {
      const personal = prospect.personalDetails || {};
      const appointmentTask = prospect.callTasks.find(
        (task) => task.taskStatus === "Appointment Scheduled"
      );

      return {
        id: prospect._id,
        groupCode: prospect.groupCode || personal.groupCode || "N/A",
        groupName: personal.groupName || personal.name || "N/A",
        name: personal.name || "N/A",
        mobileNo: personal.mobileNo || "N/A",
        contactNo: personal.contactNo || "N/A",
        organisation: personal.organisation || "N/A",
        city: personal.city || "N/A",
        leadSource: personal.leadSource || "N/A",
        status: prospect.status,
        appointmentDate: appointmentTask?.nextAppointmentDate || null,
        appointmentTime: appointmentTask?.nextAppointmentTime || null,
        scheduledOn: appointmentTask?.createdAt || null,
      };
    });

    console.log(
      `✅ Found ${formattedProspects.length} unassigned prospects with appointments`
    );

    res.status(200).json({
      success: true,
      count: formattedProspects.length,
      data: formattedProspects,
    });
  } catch (error) {
    console.error("❌ Error fetching prospects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prospects for assignment",
      error: error.message,
    });
  }
};

// ✅ Assign prospects to RM (for prospects)
exports.assignProspectsToRM = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rmId, rmName, rmCode, prospects, assignmentNotes } = req.body;

    console.log("🎯 Assigning prospects to RM:", {
      rmId,
      rmName,
      prospectsCount: prospects.length,
    });

    // Validate
    if (!rmId || !rmName || !prospects || prospects.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "RM details and prospects are required",
      });
    }

    // Check if RM exists
    const rmExists = await Employee.findOne({ _id: rmId, role: "RM" }).session(
      session
    );
    if (!rmExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Relationship Manager not found",
      });
    }

    const assignmentResults = [];
    const failedAssignments = [];

    // Assign each prospect
    for (const prospectId of prospects) {
      try {
        // Check if prospect exists
        const prospect = await TestSchema.findById(prospectId).session(session);
        if (!prospect) {
          failedAssignments.push({
            prospectId,
            error: "Prospect not found",
          });
          continue;
        }

        // Check if already assigned to any RM in RMAssignment
        const existingAssignment = await RMAssignment.findOne({
          prospectId: prospectId,
        }).session(session);

        if (existingAssignment) {
          failedAssignments.push({
            prospectId,
            error: `Already assigned to RM: ${existingAssignment.rmName}`,
          });
          continue;
        }

        // ✅ CREATE RM ASSIGNMENT ONLY
        const newAssignment = new RMAssignment({
          prospectId: prospectId,
          rmId: rmId,
          rmName: rmName,
          rmCode: rmCode,
          assignmentNotes: assignmentNotes,
          status: "assigned",
        });

        await newAssignment.save({ session });

        assignmentResults.push({
          prospectId: prospect._id,
          groupCode: prospect.groupCode,
          name: prospect.personalDetails?.name,
          success: true,
        });

        console.log(
          `✅ Prospect ${prospectId} assigned to RM ${rmName} (RMAssignment only)`
        );
      } catch (prospectError) {
        failedAssignments.push({
          prospectId,
          error: prospectError.message,
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    console.log(
      `✅ Assignment complete: ${assignmentResults.length} successful, ${failedAssignments.length} failed`
    );

    res.status(200).json({
      success: true,
      message: `Assigned ${assignmentResults.length} prospects to ${rmName}`,
      data: {
        assigned: assignmentResults,
        failed: failedAssignments,
        rmDetails: {
          id: rmId,
          name: rmName,
          code: rmCode,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: error.message,
    });
  }
};

// ✅ Get all RM assignments
exports.getRMAssignments = async (req, res) => {
  try {
    const { rmId } = req.query;

    let query = {};
    if (rmId) {
      query.rmId = rmId;
    }

    const assignments = await RMAssignment.find(query)
      .populate({
        path: "prospectId",
        select: "_id groupCode personalDetails status callTasks",
        model: "testSchema",
      })
      .sort({ assignedAt: -1 });

    // Format response
    const formattedAssignments = assignments.map((assignment, index) => {
      const prospect = assignment.prospectId;
      const personal = prospect?.personalDetails || {};
      const appointmentTask = prospect?.callTasks?.find(
        (task) => task.taskStatus === "Appointment Scheduled"
      );

      return {
        assignmentId: assignment._id,
        prospectId: prospect?._id,
        sn: index + 1,
        groupCode: prospect?.groupCode || personal.groupCode,
        groupName: personal.groupName,
        prospectName: personal.name,
        mobileNo: personal.mobileNo,
        organisation: personal.organisation,
        city: personal.city,
        leadSource: personal.leadSource,
        leadName: personal.leadName,
        callingPurpose: personal.callingPurpose,
        grade: personal.grade,
        status: prospect?.status,
        rmId: assignment.rmId,
        rmName: assignment.rmName,
        rmCode: assignment.rmCode,
        assignedAt: assignment.assignedAt,
        appointmentDate: appointmentTask?.nextAppointmentDate || null,
        appointmentTime: appointmentTask?.nextAppointmentTime || null,
        scheduledOn: appointmentTask?.createdAt || null,
        assignmentNotes: assignment.assignmentNotes,
        assignmentStatus: assignment.status,
      };
    });

    console.log(`✅ Found ${formattedAssignments.length} RM assignments`);

    res.status(200).json({
      success: true,
      count: formattedAssignments.length,
      data: formattedAssignments,
    });
  } catch (error) {
    console.error("❌ Error fetching RM assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch RM assignments",
      error: error.message,
    });
  }
};

// ✅ Get RM statistics
exports.getRMStatistics = async (req, res) => {
  try {
    const totalRMs = await Employee.countDocuments({ role: "RM" });

    const totalAssignedProspects = await TestSchema.countDocuments({
      assignedRole: "RM",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAssignments = await TestSchema.countDocuments({
      assignedRole: "RM",
      assignedAt: { $gte: today },
    });

    // Prospects available for assignment
    const availableProspects = await TestSchema.countDocuments({
      status: "prospect",
      "callTasks.taskStatus": "Appointment Scheduled",
      assignedTo: null,
    });

    res.status(200).json({
      success: true,
      data: {
        totalRMs,
        totalAssignedProspects,
        todayAssignments,
        availableProspects,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching RM statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch RM statistics",
      error: error.message,
    });
  }
};

// ✅✅✅ NEW FUNCTION: Assign SUSPECTS to RM (for RMAssignment component) ✅✅✅
exports.assignSuspectsToRM = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rmId, rmName, rmCode, suspects, assignmentNotes } = req.body;

    console.log("🟢 RM Suspect Assignment Request:", {
      rmId,
      rmName,
      suspectsCount: suspects?.length,
    });

    // Validate
    if (!rmId || !rmName || !suspects || suspects.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "RM ID, name, and at least one suspect are required",
      });
    }

    // Check if RM exists
    const rmExists = await Employee.findOne({ _id: rmId, role: "RM" }).session(
      session
    );
    if (!rmExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Relationship Manager not found",
      });
    }

    const assignmentResults = [];
    const failedAssignments = [];

    // Assign each suspect
    for (const suspectId of suspects) {
      try {
        // Check if suspect exists and is a suspect (not prospect)
        const suspect = await TestSchema.findById(suspectId).session(session);
        if (!suspect) {
          failedAssignments.push({
            suspectId,
            error: "Suspect not found",
          });
          continue;
        }

        // Check if suspect is actually a suspect
        if (suspect.status !== "suspect") {
          failedAssignments.push({
            suspectId,
            error: `Record is not a suspect (status: ${suspect.status})`,
          });
          continue;
        }

        // Check if already assigned to any RM (check TestSchema fields)
        if (suspect.assignedToRM) {
          failedAssignments.push({
            suspectId,
            error: `Already assigned to RM: ${
              suspect.assignedToRMName || "Unknown RM"
            }`,
          });
          continue;
        }

        // ✅ UPDATE TestSchema with RM assignment info
        const updatedSuspect = await TestSchema.findByIdAndUpdate(
          suspectId,
          {
            $set: {
              assignedToRM: rmId,
              assignedToRMName: rmName,
              assignedToRMCode: rmCode,
              assignedToRMAt: new Date(),
              rmAssignmentNotes: assignmentNotes || "",
              assignedRole: "RM", // Mark as assigned to RM
            },
          },
          { new: true, session }
        );

        // ✅ Also create RMAssignment record
        const newAssignment = new RMAssignment({
          prospectId: suspectId, // Still using prospectId field for consistency
          rmId: rmId,
          rmName: rmName,
          rmCode: rmCode,
          assignmentNotes: assignmentNotes,
          status: "assigned",
          isSuspect: true, // Mark that this is a suspect, not prospect
        });

        await newAssignment.save({ session });

        assignmentResults.push({
          suspectId: suspect._id,
          groupCode: suspect.personalDetails?.groupCode,
          name: suspect.personalDetails?.name,
          success: true,
        });

        console.log(`✅ Suspect ${suspectId} assigned to RM ${rmName}`);
      } catch (suspectError) {
        failedAssignments.push({
          suspectId,
          error: suspectError.message,
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    console.log(
      `✅ Suspect assignment complete: ${assignmentResults.length} successful, ${failedAssignments.length} failed`
    );

    res.status(200).json({
      success: true,
      message: `Assigned ${assignmentResults.length} suspects to ${rmName}`,
      data: {
        assigned: assignmentResults,
        failed: failedAssignments,
        rmDetails: {
          id: rmId,
          name: rmName,
          code: rmCode,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error assigning suspects to RM:", error);
    res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: error.message,
    });
  }
};

// ✅✅✅ NEW FUNCTION: Get suspects for RM assignment ✅✅✅
exports.getSuspectsForAssignment = async (req, res) => {
  try {
    console.log("🔍 Fetching SUSPECTS for RM assignment...");

    // Find suspects with appointment scheduled
    const suspects = await TestSchema.find({
      status: "suspect", // ✅ Only suspects
      "callTasks.taskStatus": "Appointment Scheduled",
    })
      .select(
        "_id groupCode personalDetails callTasks createdAt status assignedToRM assignedToRMName assignedToRMCode assignedToRMAt"
      )
      .sort({ createdAt: -1 });

    console.log(`📊 Total suspects with appointments: ${suspects.length}`);

    // Filter only unassigned suspects (assignedToRM is null or doesn't exist)
    const unassignedSuspects = suspects.filter(
      (suspect) => !suspect.assignedToRM
    );

    console.log(`📊 Unassigned suspects: ${unassignedSuspects.length}`);

    // Format response
    const formattedSuspects = unassignedSuspects.map((suspect) => {
      const personal = suspect.personalDetails || {};
      const appointmentTask = suspect.callTasks.find(
        (task) => task.taskStatus === "Appointment Scheduled"
      );

      return {
        id: suspect._id,
        groupCode: suspect.groupCode || personal.groupCode || "N/A",
        groupName: personal.groupName || personal.name || "N/A",
        name: personal.name || "N/A",
        mobileNo: personal.mobileNo || "N/A",
        contactNo: personal.contactNo || "N/A",
        organisation: personal.organisation || "N/A",
        city: personal.city || "N/A",
        leadSource: personal.leadSource || "N/A",
        grade: personal.grade || "N/A",
        gender: personal.gender || "N/A",
        callingPurpose: personal.callingPurpose || "N/A",
        area: personal.preferredMeetingArea || "N/A",
        leadName: personal.leadName || "N/A",
        status: suspect.status,
        appointmentDate: appointmentTask?.nextAppointmentDate || null,
        appointmentTime: appointmentTask?.nextAppointmentTime || null,
        scheduledOn: appointmentTask?.createdAt || null,
        appointmentRemarks: appointmentTask?.taskRemarks || "",
      };
    });

    console.log(
      `✅ Found ${formattedSuspects.length} unassigned suspects with appointments`
    );

    res.status(200).json({
      success: true,
      count: formattedSuspects.length,
      data: formattedSuspects,
    });
  } catch (error) {
    console.error("❌ Error fetching suspects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suspects for assignment",
      error: error.message,
    });
  }
};

// ✅✅✅ NEW FUNCTION: Get assigned suspects (for RMAssignment component) ✅✅✅
exports.getAssignedSuspects = async (req, res) => {
  try {
    console.log("🔍 Fetching assigned suspects...");

    // Find suspects assigned to any RM
    const assignedSuspects = await TestSchema.find({
      status: "suspect",
      assignedToRM: { $exists: true, $ne: null },
    })
      .select(
        "_id groupCode personalDetails callTasks createdAt status assignedToRM assignedToRMName assignedToRMCode assignedToRMAt"
      )
      .sort({ assignedToRMAt: -1 });

    console.log(`📊 Total assigned suspects: ${assignedSuspects.length}`);

    // Format response
    const formattedAssignments = assignedSuspects.map((suspect, index) => {
      const personal = suspect.personalDetails || {};
      const appointmentTask = suspect.callTasks?.find(
        (task) => task.taskStatus === "Appointment Scheduled"
      );

      return {
        assignmentId: suspect._id,
        suspectId: suspect._id,
        sn: index + 1,
        groupCode: suspect.groupCode || personal.groupCode,
        groupName: personal.groupName,
        suspectName: personal.name,
        mobileNo: personal.mobileNo,
        organisation: personal.organisation,
        city: personal.city,
        leadSource: personal.leadSource,
        leadName: personal.leadName,
        callingPurpose: personal.callingPurpose,
        grade: personal.grade,
        status: suspect.status,
        rmId: suspect.assignedToRM,
        rmName: suspect.assignedToRMName,
        rmCode: suspect.assignedToRMCode,
        assignedAt: suspect.assignedToRMAt,
        appointmentDate: appointmentTask?.nextAppointmentDate || null,
        appointmentTime: appointmentTask?.nextAppointmentTime || null,
        scheduledOn: appointmentTask?.createdAt || null,
        assignmentNotes: suspect.rmAssignmentNotes || "",
        isSuspect: true, // Mark as suspect
      };
    });

    console.log(`✅ Found ${formattedAssignments.length} assigned suspects`);

    res.status(200).json({
      success: true,
      count: formattedAssignments.length,
      data: formattedAssignments,
    });
  } catch (error) {
    console.error("❌ Error fetching assigned suspects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned suspects",
      error: error.message,
    });
  }
};
