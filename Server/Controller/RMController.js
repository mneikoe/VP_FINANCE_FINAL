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

exports.getAssignedSuspects = async (req, res) => {
  try {
    const { rmId } = req.query;

    console.log("🔍 ========== GET ASSIGNED SUSPECTS ==========");
    console.log("📌 Request Query:", req.query);
    console.log("📌 RM ID:", rmId);

    if (!rmId) {
      console.log("❌ RM ID is missing!");
      return res.status(400).json({
        success: false,
        message: "RM ID is required",
      });
    }

    // Check if RM exists
    const rmExists = await Employee.findOne({ _id: rmId, role: "RM" });
    if (!rmExists) {
      console.log("❌ RM not found in Employee collection");
      return res.status(404).json({
        success: false,
        message: "Relationship Manager not found",
      });
    }

    console.log("🔍 Finding suspects for RM:", rmId);

    // Find suspects assigned to this RM
    const assignedSuspects = await TestSchema.find({
      status: "suspect",
      assignedToRM: rmId,
    })
      .select(
        "_id groupCode personalDetails callTasks createdAt status assignedToRM assignedToRMName assignedToRMCode assignedToRMAt rmAssignmentNotes"
      )
      .sort({ assignedToRMAt: -1 });

    console.log(`📊 Raw query result count: ${assignedSuspects.length}`);

    // Log each suspect found
    assignedSuspects.forEach((suspect, index) => {
      console.log(`\n📝 Suspect ${index + 1}:`);
      console.log(`   ID: ${suspect._id}`);
      console.log(`   Name: ${suspect.personalDetails?.name || "N/A"}`);
      console.log(`   Status: ${suspect.status}`);
      console.log(`   Assigned to RM: ${suspect.assignedToRM}`);
      console.log(`   Has callTasks: ${suspect.callTasks?.length || 0}`);

      // Check for appointment scheduled
      const appointmentTasks = suspect.callTasks?.filter(
        (task) => task.taskStatus === "Appointment Scheduled"
      );
      console.log(`   Appointment tasks: ${appointmentTasks?.length || 0}`);
    });

    // Format response
    const formattedSuspects = assignedSuspects.map((suspect, index) => {
      const personal = suspect.personalDetails || {};

      // Get appointment tasks
      const appointmentTasks =
        suspect.callTasks?.filter(
          (task) => task.taskStatus === "Appointment Scheduled"
        ) || [];

      // Get the latest appointment
      let latestAppointment = null;
      if (appointmentTasks.length > 0) {
        latestAppointment = appointmentTasks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
      }

      const formattedSuspect = {
        suspectId: suspect._id,
        sn: index + 1,
        groupCode: suspect.groupCode || personal.groupCode || "N/A",
        groupName: personal.groupName || "N/A",
        suspectName: personal.name || "N/A",
        mobileNo: personal.mobileNo || "N/A",
        organisation: personal.organisation || "N/A",
        city: personal.city || "N/A",
        leadSource: personal.leadSource || "N/A",
        leadName: personal.leadName || "N/A",
        callingPurpose: personal.callingPurpose || "N/A",
        grade: personal.grade || "N/A",
        status: suspect.status,
        rmId: suspect.assignedToRM,
        rmName: suspect.assignedToRMName,
        rmCode: suspect.assignedToRMCode,
        assignedAt: suspect.assignedToRMAt,
        appointmentDate: latestAppointment?.nextAppointmentDate || null,
        appointmentTime: latestAppointment?.nextAppointmentTime || null,
        scheduledOn: latestAppointment?.createdAt || null,
        appointmentRemarks: latestAppointment?.taskRemarks || "",
        assignmentNotes: suspect.rmAssignmentNotes || "",
        contactNo: personal.contactNo || "N/A",
        leadOccupation: personal.leadOccupation || "N/A",
        area: personal.city || personal.preferredMeetingArea || "N/A",
        remark:
          latestAppointment?.taskRemarks || suspect.rmAssignmentNotes || "",
      };

      console.log(
        `✅ Formatted suspect ${index + 1}:`,
        formattedSuspect.suspectName
      );
      return formattedSuspect;
    });

    console.log(`\n🎯 Total formatted suspects: ${formattedSuspects.length}`);
    console.log("✅ ========== END GET ASSIGNED SUSPECTS ==========\n");

    res.status(200).json({
      success: true,
      count: formattedSuspects.length,
      data: formattedSuspects,
    });
  } catch (error) {
    console.error("❌ ========== ERROR IN GET ASSIGNED SUSPECTS ==========");
    console.error("❌ Error:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ ==================================================\n");

    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned suspects",
      error: error.message,
    });
  }
};
