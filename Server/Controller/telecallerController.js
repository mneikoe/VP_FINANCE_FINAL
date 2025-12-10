const Telecaller = require("../Models/telecallerModel");
const Test = require("../Models/SusProsClientSchema"); // ✅ Correct model import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// ✅ Register Controller
const registerTelecaller = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if telecaller already exists
    const existingUser = await Telecaller.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTelecaller = new Telecaller({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "Telecaller", // ✅ role fixed
    });

    await newTelecaller.save();

    res.status(201).json({
      message: "Telecaller registered successfully",
      telecaller: {
        id: newTelecaller._id,
        username: newTelecaller.username,
        email: newTelecaller.email,
        mobileno: newTelecaller.mobileno,
        role: newTelecaller.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering telecaller",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginTelecaller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const telecaller = await Telecaller.findOne({ email });
    if (!telecaller) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, telecaller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: telecaller._id, role: telecaller.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      telecaller: {
        id: telecaller._id,
        username: telecaller.username,
        email: telecaller.email,
        mobileno: telecaller.mobileno,
        role: telecaller.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

// ✅ Get All Telecallers
const getAllTelecallers = async (req, res) => {
  try {
    const telecallers = await Telecaller.find().select("-password"); // password hide
    res.json({
      message: "All telecallers fetched successfully",
      count: telecallers.length,
      telecallers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching telecallers",
      error: error.message,
    });
  }
};

// ✅ Get Telecaller by ID
const getTelecallerById = async (req, res) => {
  try {
    const { id } = req.params;
    const telecaller = await Telecaller.findById(id).select("-password");
    if (!telecaller) {
      return res.status(404).json({ message: "Telecaller not found" });
    }
    res.json({
      message: "Telecaller fetched successfully",
      telecaller,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching telecaller",
      error: error.message,
    });
  }
};

// // 🔥 FIXED: Assign Suspects to Telecaller
// const assignSuspectsToTelecaller = async (req, res) => {
//   try {
//     const { role, selectedPerson, suspects } = req.body;

//     // ✅ Validation checks
//     if (!role || !selectedPerson || !suspects || suspects.length === 0) {
//       return res.status(400).json({
//         message: "Missing required fields: role, selectedPerson, and suspects are required"
//       });
//     }

//     // ✅ Check if telecaller exists (agar role telecaller hai)
//     if (role === "Telecaller") {
//       const telecaller = await Telecaller.findById(selectedPerson);
//       if (!telecaller) {
//         return res.status(404).json({ message: "Telecaller not found" });
//       }
//     }

//     // ✅ Check if all suspects exist
//     const existingSuspects = await Test.find({ _id: { $in: suspects } });
//     if (existingSuspects.length !== suspects.length) {
//       return res.status(404).json({
//         message: "One or more suspects not found",
//         found: existingSuspects.length,
//         requested: suspects.length
//       });
//     }

//     // ✅ Update suspects with assigned telecaller info
//     const updateResult = await Test.updateMany(
//       { _id: { $in: suspects } },
//       {
//         $set: {
//           assignedTo: selectedPerson,
//           assignedRole: role,
//           assignedAt: new Date()
//         }
//       }
//     );

//     // 🔥 FIXED: Update telecaller's assigned suspects array with proper structure
//     if (role === "Telecaller") {
//       const suspectObjects = suspects.map(suspectId => ({
//         suspectId: suspectId,
//         assignedAt: new Date()
//       }));

//       await Telecaller.findByIdAndUpdate(
//         selectedPerson,
//         {
//           $addToSet: {
//             assignedSuspects: { $each: suspectObjects }
//           }
//         }
//       );
//     }

//     // ✅ Get updated suspects details for response
//     const updatedSuspects = await Test.find({ _id: { $in: suspects } })
//       .select("personalDetails assignedTo assignedRole assignedAt status")
//       .populate("assignedTo", "username email");

//     res.status(200).json({
//       success: true,
//       message: `Successfully assigned ${updateResult.modifiedCount} suspects to ${role}`,
//       data: {
//         role: role,
//         selectedPerson: selectedPerson,
//         assignedSuspectsCount: updateResult.modifiedCount,
//         assignedSuspects: updatedSuspects
//       }
//     });

//   } catch (error) {
//     console.error("Error assigning suspects:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error assigning suspects to telecaller",
//       error: error.message,
//     });
//   }
// };

// // 🔥 FIXED: Get Assigned Suspects for Telecaller
// // const getAssignedSuspects = async (req, res) => {
// //   try {
// //     const { telecallerId } = req.params;

// //     // ✅ Check if telecaller exists
// //     const telecaller = await Telecaller.findById(telecallerId)
// //       .populate({
// //         path: "assignedSuspects.suspectId",
// //         select: "personalDetails status", // assignedAt telecaller ke array se lenge
// //       });

// //     if (!telecaller) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Telecaller not found",
// //       });
// //     }

// //     // 🔥 OPTION 1: From telecaller.assignedSuspects
// //     const assignedFromTelecaller = telecaller.assignedSuspects
// //       .filter((item) => item.suspectId) // Ensure suspectId exists
// //       .map((item) => ({
// //         ...item.suspectId.toObject(),
// //         assignedAt: item.assignedAt, // ✅ assigned date from Telecaller schema
// //       }));

// //     // 🔥 OPTION 2: From Test collection (fallback)
// //     const assignedFromTest = await Test.find({ assignedTo: telecallerId })
// //       .select("personalDetails assignedAt status") // ✅ assignedAt from Test schema
// //       .sort({ assignedAt: -1 })
// //       .lean();

// //     // ✅ Choose telecaller array if available, else Test
// //     const assignedSuspects =
// //       assignedFromTelecaller.length > 0 ? assignedFromTelecaller : assignedFromTest;

// //     res.status(200).json({
// //       success: true,
// //       message: "Assigned suspects fetched successfully",
// //       data: {
// //         telecaller: {
// //           id: telecaller._id,
// //           username: telecaller.username,
// //           email: telecaller.email,
// //         },
// //         assignedSuspectsCount: assignedSuspects.length,
// //         assignedSuspects: assignedSuspects.map((s) => ({
// //           ...s,
// //           assignedAt: s.assignedAt || null, // ✅ ensure date always included
// //         })),
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Error fetching assigned suspects:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Error fetching assigned suspects",
// //       error: error.message,
// //     });
// //   }
// // };
// const getAssignedSuspects = async (req, res) => {
//   try {
//     const { telecallerId } = req.params;

//     // ✅ Telecaller ke assigned suspects populate karo
//     const telecaller = await Telecaller.findById(telecallerId)
//       .populate({
//         path: "assignedSuspects.suspectId",
//         select: "personalDetails status",
//       })
//       .lean();

//     if (!telecaller) {
//       return res.status(404).json({
//         success: false,
//         message: "Telecaller not found",
//       });
//     }

//     // 🔥 Merge suspect details + assignedAt from telecaller array
//     const assignedFromTelecaller = telecaller.assignedSuspects
//       .filter(item => item.suspectId)
//       .map(item => ({
//         ...item.suspectId,         // suspect ke details
//         assignedAt: item.assignedAt || null, // ✅ assign date (task assign time)
//       }));

//     // 🔥 Fallback → Agar direct Test collection use karna ho
//     const assignedFromTest = await Test.find({ assignedTo: telecallerId })
//       .select("personalDetails assignedAt status")
//       .sort({ assignedAt: -1 })
//       .lean();

//     // ✅ Agar telecaller.assignedSuspects me data hai to wahi use hoga
//     const assignedSuspects =
//       assignedFromTelecaller.length > 0 ? assignedFromTelecaller : assignedFromTest;

//     res.status(200).json({
//       success: true,
//       message: "Assigned suspects fetched successfully",
//       data: {
//         telecaller: {
//           id: telecaller._id,
//           username: telecaller.username,
//           email: telecaller.email,
//         },
//         assignedSuspectsCount: assignedSuspects.length,
//         assignedSuspects: assignedSuspects.map(s => ({
//           ...s,
//           // ✅ ensure date always included
//           assignedAt: s.assignedAt || null,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching assigned suspects:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching assigned suspects",
//       error: error.message,
//     });
//   }
// };
// 🔥 FIXED: Assign Suspects to Telecaller
const assignSuspectsToTelecaller = async (req, res) => {
  try {
    const { role, selectedPerson, suspects } = req.body;

    if (!role || !selectedPerson || !suspects || suspects.length === 0) {
      return res.status(400).json({
        message:
          "Missing required fields: role, selectedPerson, and suspects are required",
      });
    }

    if (role === "Telecaller") {
      const telecaller = await Telecaller.findById(selectedPerson);
      if (!telecaller)
        return res.status(404).json({ message: "Telecaller not found" });
    }

    const existingSuspects = await Test.find({ _id: { $in: suspects } });
    if (existingSuspects.length !== suspects.length) {
      return res.status(404).json({
        message: "One or more suspects not found",
        found: existingSuspects.length,
        requested: suspects.length,
      });
    }

    const now = new Date();

    // ✅ Update Test collection
    await Test.updateMany(
      { _id: { $in: suspects } },
      {
        $set: {
          assignedTo: selectedPerson,
          assignedRole: role,
          assignedAt: now,
        },
      }
    );

    // ✅ Update Telecaller assignedSuspects with status + date
    if (role === "Telecaller") {
      const suspectObjects = suspects.map((suspectId) => ({
        suspectId,
        assignedAt: now,
        status: "assigned", // ✅ new field
      }));

      await Telecaller.findByIdAndUpdate(selectedPerson, {
        $addToSet: { assignedSuspects: { $each: suspectObjects } },
      });
    }

    const updatedSuspects = await Test.find({ _id: { $in: suspects } })
      .select("personalDetails assignedTo assignedRole assignedAt status")
      .populate("assignedTo", "username email");

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${suspects.length} suspects to ${role}`,
      data: {
        role,
        selectedPerson,
        assignedSuspectsCount: suspects.length,
        assignedSuspects: updatedSuspects,
      },
    });
  } catch (error) {
    console.error("Error assigning suspects:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning suspects to telecaller",
      error: error.message,
    });
  }
};

// ✅ FIXED: Get ALL assigned suspects without any filtering
const getAssignedSuspects = async (req, res) => {
  try {
    const { telecallerId } = req.params;
    console.log(`[GET_SUSPECTS] - Telecaller: ${telecallerId}`);

    // ✅ GET ALL suspects without filtering closed calls
    const assignedSuspects = await Test.find({
      assignedTo: telecallerId,
      status: "suspect",
    })
      .select("personalDetails callTasks assignedTo assignedAt status")
      .populate("assignedTo", "username email")
      .sort({ assignedAt: -1 })
      .lean();

    console.log(`[GET_SUSPECTS] - Found ${assignedSuspects.length} suspects`);

    // ✅ ENHANCE RESPONSE - NO FILTERING, SHOW EVERYTHING
    const enhancedSuspects = assignedSuspects.map((suspect) => {
      // Ensure callTasks exists
      const callTasks = suspect.callTasks || [];

      // Get latest task
      const latestTask =
        callTasks.length > 0
          ? callTasks.reduce((latest, task) => {
              if (!task.taskDate) return latest;
              const taskDate = new Date(task.taskDate);
              if (!latest) return task;
              const latestDate = new Date(latest.taskDate);
              return taskDate > latestDate ? task : latest;
            }, null)
          : null;

      const currentStatus = latestTask
        ? latestTask.taskStatus
        : "Not Contacted";

      return {
        ...suspect,
        // Ensure dates are properly formatted
        assignedAt: suspect.assignedAt ? new Date(suspect.assignedAt) : null,
        callTasks: callTasks.map((task) => ({
          ...task,
          taskDate: task.taskDate ? new Date(task.taskDate) : null,
          nextFollowUpDate: task.nextFollowUpDate
            ? new Date(task.nextFollowUpDate)
            : null,
          nextAppointmentDate: task.nextAppointmentDate
            ? new Date(task.nextAppointmentDate)
            : null,
        })),
        latestCallStatus: currentStatus,
        nextFollowUpDate: latestTask ? latestTask.nextFollowUpDate : null,
        nextFollowUpTime: latestTask ? latestTask.nextFollowUpTime : null,
        nextAppointmentDate: latestTask ? latestTask.nextAppointmentDate : null,
        nextAppointmentTime: latestTask ? latestTask.nextAppointmentTime : null,
        totalCallTasks: callTasks.length,
      };
    });

    console.log(
      `[GET_SUSPECTS] - Showing ALL ${enhancedSuspects.length} suspects`
    );

    res.status(200).json({
      success: true,
      message: "All assigned suspects fetched successfully",
      data: {
        telecaller: {
          id: telecallerId,
        },
        assignedSuspectsCount: enhancedSuspects.length,
        assignedSuspects: enhancedSuspects,
      },
    });
  } catch (error) {
    console.error("[GET_SUSPECTS] - Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned suspects",
      error: error.message,
    });
  }
};
// ✅ UPDATED: Get today's active suspects (Hide forwarded calls with future dates)
// ✅ FIXED: Get today's active suspects - Only shows suspects that should be contacted TODAY
const getTodaysActiveSuspects = async (req, res) => {
  try {
    const { telecallerId } = req.params;

    if (!telecallerId) {
      return res.status(400).json({
        success: false,
        message: "Telecaller ID is required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(
      `📅 Fetching today's active suspects for: ${today.toISOString()}`
    );

    // Get all suspects assigned to this telecaller
    const allAssigned = await Test.find({
      assignedTo: telecallerId,
      status: "suspect",
    })
      .select("personalDetails callTasks assignedTo assignedAt status")
      .populate("assignedTo", "username email")
      .lean();

    // ✅ STRICT FILTER: Only show suspects that should be contacted TODAY
    const todaysActive = allAssigned.filter((suspect) => {
      // If no call tasks = Not Contacted (show only if assigned today or pending)
      if (!suspect.callTasks || suspect.callTasks.length === 0) {
        const assignedDate = new Date(suspect.assignedAt);
        assignedDate.setHours(0, 0, 0, 0);
        // Show if assigned today OR if it's an older assignment that was never contacted
        return assignedDate.getTime() <= today.getTime();
      }

      // Get latest call task
      const sortedTasks = suspect.callTasks.sort(
        (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
      );
      const latestTask = sortedTasks[0];
      const latestStatus = latestTask.taskStatus;

      // ✅ Define status categories
      const forwardedStatuses = [
        "Call Not Picked",
        "Busy on Another Call",
        "Call After Sometimes",
        "Others",
      ];

      const closedStatuses = [
        "Not Reachable",
        "Wrong Number",
        "Not Interested",
      ];

      // ✅ HIDE closed calls completely
      if (closedStatuses.includes(latestStatus)) {
        return false;
      }

      // ✅ NOT CONTACTED - Always show (they need first contact)
      if (latestStatus === "Not Contacted") {
        return true;
      }

      // ✅ CALLBACK - Show only if scheduled for TODAY
      if (latestStatus === "Callback" && latestTask.nextFollowUpDate) {
        const callbackDate = new Date(latestTask.nextFollowUpDate);
        callbackDate.setHours(0, 0, 0, 0);
        return callbackDate.getTime() === today.getTime();
      }

      // ✅ FORWARDED STATUSES - Show only if nextFollowUpDate is TODAY or in PAST
      if (forwardedStatuses.includes(latestStatus)) {
        if (latestTask.nextFollowUpDate) {
          const nextFollowUp = new Date(latestTask.nextFollowUpDate);
          nextFollowUp.setHours(0, 0, 0, 0);

          // Show if next follow-up is today or overdue (past)
          return nextFollowUp.getTime() <= today.getTime();
        }
        // If no nextFollowUpDate but status is forwarded, show it (needs attention)
        return true;
      }

      // ✅ APPOINTMENT DONE - Show only if has next appointment TODAY
      if (latestStatus === "Appointment Scheduled") {
        if (latestTask.nextAppointmentDate) {
          const nextAppointment = new Date(latestTask.nextAppointmentDate);
          nextAppointment.setHours(0, 0, 0, 0);
          return nextAppointment.getTime() === today.getTime();
        }
        // If no next appointment, don't show in today's calls
        return false;
      }

      // Default: don't show
      return false;
    });

    console.log(
      `📅 Today's active suspects: ${todaysActive.length} out of ${allAssigned.length} total`
    );

    // Log breakdown for debugging
    const statusBreakdown = {};
    todaysActive.forEach((suspect) => {
      let status = "Not Contacted";
      if (suspect.callTasks && suspect.callTasks.length > 0) {
        const latestTask = suspect.callTasks.sort(
          (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
        )[0];
        status = latestTask.taskStatus;
      }
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });
    console.log("📊 Today's calls breakdown:", statusBreakdown);

    res.json({
      success: true,
      data: {
        assignedSuspects: todaysActive,
        count: todaysActive.length,
      },
    });
  } catch (error) {
    console.error("Error fetching today's active suspects:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching today's active suspects",
      error: error.message,
    });
  }
};
// ✅ ENHANCED: Get suspects by next call date with better logging
const getSuspectsByNextCallDate = async (req, res) => {
  try {
    const { telecallerId, date } = req.params;

    if (!telecallerId || !date) {
      return res.status(400).json({
        success: false,
        message: "Telecaller ID and date are required",
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log(`📅 Fetching scheduled calls for date: ${date}`);

    // Get suspects with next call/follow-up on the target date
    const suspects = await Test.find({
      assignedTo: telecallerId,
      status: "suspect",
      callTasks: {
        $elemMatch: {
          $or: [
            { nextFollowUpDate: { $gte: targetDate, $lt: nextDay } },
            { nextAppointmentDate: { $gte: targetDate, $lt: nextDay } },
          ],
        },
      },
    })
      .select("personalDetails callTasks assignedTo assignedAt status")
      .populate("assignedTo", "username email")
      .lean();

    console.log(`📅 Raw suspects found for ${date}: ${suspects.length}`);

    // Enhanced response with next action info
    const enhancedSuspects = suspects
      .map((suspect) => {
        const latestTask = suspect.callTasks.sort(
          (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
        )[0];

        // Exclude closed calls
        const closedStatuses = [
          "Not Reachable",
          "Wrong Number",
          "Not Interested",
        ];
        if (closedStatuses.includes(latestTask.taskStatus)) {
          return null;
        }

        let nextAction = { type: "none", date: null, time: null };

        // Check for follow-up action
        if (latestTask.nextFollowUpDate) {
          const followUpDate = new Date(latestTask.nextFollowUpDate);
          followUpDate.setHours(0, 0, 0, 0);

          if (followUpDate.getTime() === targetDate.getTime()) {
            nextAction = {
              type: "call",
              date: latestTask.nextFollowUpDate,
              time: latestTask.nextFollowUpTime,
              status: latestTask.taskStatus,
            };
          }
        }

        // Check for appointment action
        if (latestTask.nextAppointmentDate) {
          const appointmentDate = new Date(latestTask.nextAppointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);

          if (appointmentDate.getTime() === targetDate.getTime()) {
            nextAction = {
              type: "appointment",
              date: latestTask.nextAppointmentDate,
              time: latestTask.nextAppointmentTime,
              status: latestTask.taskStatus,
            };
          }
        }

        // Only include if there's a valid next action for the target date
        if (nextAction.type === "none") {
          return null;
        }

        return {
          ...suspect,
          nextAction,
        };
      })
      .filter((suspect) => suspect !== null);

    console.log(
      `📅 Final scheduled calls for ${date}: ${enhancedSuspects.length}`
    );

    // Log details for debugging
    enhancedSuspects.forEach((suspect) => {
      console.log(
        `   - ${suspect.personalDetails?.name}: ${suspect.nextAction.type} at ${suspect.nextAction.time}`
      );
    });

    res.json({
      success: true,
      data: {
        date: date,
        suspects: enhancedSuspects,
        count: enhancedSuspects.length,
      },
    });
  } catch (error) {
    console.error("Error fetching suspects by date:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching suspects by date",
      error: error.message,
    });
  }
};
// ✅ NEW: Get telecaller dashboard stats
// ✅ FIXED: Get telecaller stats for TODAY only
const getTelecallerStats = async (req, res) => {
  try {
    const { telecallerId } = req.params;

    if (!telecallerId) {
      return res.status(400).json({
        success: false,
        message: "Telecaller ID is required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`📊 Fetching TODAY's stats for: ${today.toISOString()}`);

    // Get assigned suspects for this telecaller
    const assignedSuspects = await Test.find({
      assignedTo: telecallerId,
      status: "suspect",
    }).populate("callTasks");

    const stats = {
      total: assignedSuspects.length, // Total assigned (all time)
      notContacted: 0,
      forwarded: 0, // ✅ ONLY forwarded with today's nextFollowUpDate
      callback: 0, // ✅ ONLY callbacks with today's nextFollowUpDate
      appointmentScheduled: 0, // ✅ ONLY appointment scheduled with today's nextAppointmentDate
      notInterested: 0,
    };

    assignedSuspects.forEach((suspect) => {
      let latestStatus = "Not Contacted";
      let latestTask = null;

      if (suspect.callTasks && suspect.callTasks.length > 0) {
        const sortedTasks = suspect.callTasks.sort(
          (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
        );
        latestTask = sortedTasks[0];
        latestStatus = latestTask.taskStatus;
      }

      // ✅ NOT CONTACTED - Count all not contacted
      if (latestStatus === "Not Contacted") {
        stats.notContacted++;
      }

      // ✅ FORWARDED STATUSES - Count only if nextFollowUpDate is TODAY
      else if (
        [
          "Call Not Picked",
          "Call After Sometimes",
          "Busy on Another Call",
          "Others",
        ].includes(latestStatus)
      ) {
        if (latestTask && latestTask.nextFollowUpDate) {
          const nextFollowUp = new Date(latestTask.nextFollowUpDate);
          nextFollowUp.setHours(0, 0, 0, 0);
          if (nextFollowUp.getTime() === today.getTime()) {
            stats.forwarded++;
          }
        }
      }

      // ✅ CALLBACK - Count only if nextFollowUpDate is TODAY
      else if (latestStatus === "Callback") {
        if (latestTask && latestTask.nextFollowUpDate) {
          const callbackDate = new Date(latestTask.nextFollowUpDate);
          callbackDate.setHours(0, 0, 0, 0);
          if (callbackDate.getTime() === today.getTime()) {
            stats.callback++;
          }
        }
      }

      // ✅ APPOINTMENT SCHEDULED - Count only if nextAppointmentDate is TODAY
      else if (latestStatus === "Appointment Scheduled") {
        if (latestTask && latestTask.nextAppointmentDate) {
          const appointmentDate = new Date(latestTask.nextAppointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
          if (appointmentDate.getTime() === today.getTime()) {
            stats.appointmentScheduled++;
          }
        }
      }

      // ✅ CLOSED CALLS - Count all (Not Interested, Not Reachable, Wrong Number)
      else if (
        ["Not Interested", "Not Reachable", "Wrong Number"].includes(
          latestStatus
        )
      ) {
        stats.notInterested++;
      }
    });

    console.log(`📊 TODAY's Stats:`, stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching telecaller stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching stats",
      error: error.message,
    });
  }
};
// ✅ NEW: Get appointments scheduled for telecaller
const getTelecallerAppointments = async (req, res) => {
  try {
    const { telecallerId } = req.params;
    const { dateFilter = "all", startDate, endDate } = req.query;

    if (!telecallerId) {
      return res.status(400).json({
        success: false,
        message: "Telecaller ID is required",
      });
    }

    console.log(`📅 Fetching appointments for telecaller: ${telecallerId}`);

    let assignedToQuery = telecallerId;

    // Agar valid ObjectId hai to mongoose.Types.ObjectId use karo
    if (mongoose.Types.ObjectId.isValid(telecallerId)) {
      assignedToQuery = new mongoose.Types.ObjectId(telecallerId);
      console.log("✅ Using ObjectId query");
    } else {
      console.log("⚠️ Using string query (not a valid ObjectId)");
    }

    // Today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build date filter query
    let dateQuery = {};

    if (dateFilter === "today") {
      dateQuery = {
        "callTasks.nextAppointmentDate": {
          $gte: today,
          $lt: tomorrow,
        },
      };
    } else if (dateFilter === "tomorrow") {
      const tomorrowDate = new Date(today);
      tomorrowDate.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrowDate);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      dateQuery = {
        "callTasks.nextAppointmentDate": {
          $gte: tomorrowDate,
          $lt: dayAfterTomorrow,
        },
      };
    } else if (dateFilter === "this_week") {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      dateQuery = {
        "callTasks.nextAppointmentDate": {
          $gte: weekStart,
          $lt: weekEnd,
        },
      };
    } else if (dateFilter === "this_month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      dateQuery = {
        "callTasks.nextAppointmentDate": {
          $gte: monthStart,
          $lt: monthEnd,
        },
      };
    } else if (dateFilter === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateQuery = {
        "callTasks.nextAppointmentDate": {
          $gte: start,
          $lte: end,
        },
      };
    }
    // For 'all', no date filter

    // Find suspects assigned to telecaller with Appointment Scheduled status
    const query = {
      $or: [
        { assignedTo: assignedToQuery }, // For ObjectId
        { assignedTo: telecallerId }, // For string
      ],
      $or: [{ status: "suspect" }],
      "callTasks.taskStatus": "Appointment Scheduled",
      ...dateQuery,
    };
    console.log("🔍 Query for appointments:", JSON.stringify(query, null, 2));

    const suspectsWithAppointments = await Test.find(query)
      .select("personalDetails callTasks assignedTo assignedAt status")
      .populate("assignedTo", "username email")
      .lean();

    console.log(
      `✅ Found ${suspectsWithAppointments.length} suspects with appointments`
    );

    // Process results to get latest appointment task
    const appointments = suspectsWithAppointments
      .map((suspect) => {
        // Get only Appointment Scheduled tasks
        const appointmentTasks = suspect.callTasks.filter(
          (task) => task.taskStatus === "Appointment Scheduled"
        );

        if (appointmentTasks.length === 0) return null;

        // Get latest appointment task
        const latestAppointment = appointmentTasks.reduce((latest, task) => {
          if (!latest) return task;
          const taskDate = new Date(task.taskDate || 0);
          const latestDate = new Date(latest.taskDate || 0);
          return taskDate > latestDate ? task : latest;
        }, null);

        if (!latestAppointment || !latestAppointment.nextAppointmentDate) {
          return null;
        }

        // Apply date filter on application level for safety
        const appointmentDate = new Date(latestAppointment.nextAppointmentDate);
        appointmentDate.setHours(0, 0, 0, 0);

        let shouldInclude = true;
        if (dateFilter === "today") {
          shouldInclude = appointmentDate.getTime() === today.getTime();
        } else if (dateFilter === "tomorrow") {
          const tomorrowDate = new Date(today);
          tomorrowDate.setDate(today.getDate() + 1);
          shouldInclude = appointmentDate.getTime() === tomorrowDate.getTime();
        } else if (dateFilter === "this_week") {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          shouldInclude =
            appointmentDate >= weekStart && appointmentDate < weekEnd;
        } else if (dateFilter === "this_month") {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            1
          );
          shouldInclude =
            appointmentDate >= monthStart && appointmentDate < monthEnd;
        } else if (dateFilter === "custom" && startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          shouldInclude = appointmentDate >= start && appointmentDate <= end;
        }

        if (!shouldInclude) return null;

        return {
          ...suspect,
          latestAppointment,
          appointmentDate: latestAppointment.nextAppointmentDate,
          appointmentTime: latestAppointment.nextAppointmentTime,
          scheduledOn: latestAppointment.taskDate,
          appointmentStatus: latestAppointment.taskStatus,
          appointmentRemarks: latestAppointment.taskRemarks,
        };
      })
      .filter((appointment) => appointment !== null);

    // Calculate stats
    const stats = {
      today: appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() === today.getTime();
      }).length,
      tomorrow: appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        const tomorrowDate = new Date(today);
        tomorrowDate.setDate(today.getDate() + 1);
        return appDate.getTime() === tomorrowDate.getTime();
      }).length,
      total: appointments.length,
      suspects: appointments.filter((app) => app.status === "suspect").length,
      prospects: appointments.filter((app) => app.status === "prospect").length,
    };

    console.log(`📊 Appointment stats:`, stats);

    res.json({
      success: true,
      message: "Appointments fetched successfully",
      data: {
        appointments,
        stats,
        count: appointments.length,
        telecallerId,
        dateFilter,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching telecaller appointments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
      error: error.message,
    });
  }
};
module.exports = {
  registerTelecaller,
  loginTelecaller,
  getAllTelecallers,
  getTelecallerById,
  assignSuspectsToTelecaller,
  getAssignedSuspects,
  getTelecallerStats,
  getTodaysActiveSuspects, // ✅ NEW
  getSuspectsByNextCallDate,
  getTelecallerAppointments, // ✅ NEW
};
