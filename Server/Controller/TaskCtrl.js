import GetModelByType from "../utils/GetModelByType.js";
import FinancialProductModel from "../Models/FinancialProductModel.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Employee from "../Models/employeeModel.js";
import SusProsClient from "../Models/SusProsClientSchema.js";
import Telecaller from "../Models/telecallerModel.js";
import HR from "../Models/HRModel.js";
import notificationService from "../utils/notificationService.js";
// createTask function mein sirf formChecklists part update karo:
export const createTask = async (req, res) => {
  try {
    const type = req.body.type || "composite";
    console.log(`📝 Creating ${type} task`);

    const TaskModel = GetModelByType(type);

    // Validate required fields
    if (!req.body.cat || !req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: cat, name",
      });
    }

    // Handle depart as array
    let departArray = [];
    if (Array.isArray(req.body.depart)) {
      departArray = req.body.depart;
    } else if (typeof req.body.depart === "string") {
      departArray = req.body.depart.split(",");
    } else if (req.body.depart) {
      departArray = [req.body.depart];
    }

    // Handle files
    const image = req.files?.image?.[0]?.filename || "";

    // Prepare checklists
    const checklists = Array.isArray(req.body.checklists)
      ? req.body.checklists.filter((item) => item && item.trim() !== "")
      : [];

    // ✅ FIXED: Parse formChecklists properly - DEBUG ke liye console.log add karo
    let formChecklists = [];
    if (req.body.formChecklists) {
      try {
        // Agar string hai to parse karo
        if (typeof req.body.formChecklists === "string") {
          const parsed = JSON.parse(req.body.formChecklists);
          if (Array.isArray(parsed)) {
            formChecklists = parsed;
          }
        } else if (Array.isArray(req.body.formChecklists)) {
          formChecklists = req.body.formChecklists;
        }

        console.log("✅ Parsed formChecklists:", formChecklists);

        // ✅ newDownloadIndices / newSampleIndices se files ko sahi index pe map karo
        let newDownloadIndices = [];
        let newSampleIndices = [];
        if (req.body.newDownloadIndices) {
          try {
            newDownloadIndices =
              typeof req.body.newDownloadIndices === "string"
                ? JSON.parse(req.body.newDownloadIndices)
                : req.body.newDownloadIndices;
          } catch (e) {
            console.warn("newDownloadIndices parse error", e);
          }
        }
        if (req.body.newSampleIndices) {
          try {
            newSampleIndices =
              typeof req.body.newSampleIndices === "string"
                ? JSON.parse(req.body.newSampleIndices)
                : req.body.newSampleIndices;
          } catch (e) {
            console.warn("newSampleIndices parse error", e);
          }
        }

        const downloadFiles = req.files?.downloadFormUrl
          ? Array.isArray(req.files.downloadFormUrl)
            ? req.files.downloadFormUrl
            : [req.files.downloadFormUrl]
          : [];
        const sampleFiles = req.files?.sampleFormUrl
          ? Array.isArray(req.files.sampleFormUrl)
            ? req.files.sampleFormUrl
            : [req.files.sampleFormUrl]
          : [];

        formChecklists = formChecklists.map((item, index) => {
          const checklistItem = {
            name: item.name?.trim() || "",
            downloadFormUrl: item.downloadFormUrl || "",
            sampleFormUrl: item.sampleFormUrl || "",
          };

          const di = newDownloadIndices.indexOf(index);
          if (di !== -1 && downloadFiles[di]) {
            checklistItem.downloadFormUrl = downloadFiles[di].filename;
          }
          const si = newSampleIndices.indexOf(index);
          if (si !== -1 && sampleFiles[si]) {
            checklistItem.sampleFormUrl = sampleFiles[si].filename;
          }

          return checklistItem;
        });
        formChecklists = formChecklists.filter((item) => item.name);
      } catch (error) {
        console.error("❌ Error in formChecklists processing:", error);
      }
    }

    console.log("💾 Final formChecklists to save:", formChecklists);

    // ✅ IMPORTANT: Agar formChecklists array empty hai to empty array set karo
    if (!Array.isArray(formChecklists)) {
      formChecklists = [];
    }

    // Create task data
    const taskData = {
      cat: req.body.cat,
      sub: req.body.sub || "",
      depart: departArray,
      name: req.body.name,
      estimatedDays: parseInt(req.body.estimatedDays) || 1,
      templatePriority: req.body.templatePriority || "medium",
      taskMode: req.body.taskMode === "default" ? "default" : "assigned",
      monthlyWindowFrom: req.body.monthlyWindowFrom
        ? parseInt(req.body.monthlyWindowFrom, 10)
        : null,
      monthlyWindowTo: req.body.monthlyWindowTo
        ? parseInt(req.body.monthlyWindowTo, 10)
        : null,
      descp: {
        text: req.body.descpText || "",
        image: image,
      },
      email_descp: req.body.email_descp || "",
      sms_descp: req.body.sms_descp || "",
      whatsapp_descp: req.body.whatsapp_descp || "",
      checklists: checklists,
      formChecklists: formChecklists, // ✅ Yeh ab properly save hoga
      status: req.body.status || "template",
      createdBy: req.user?.id,
    };

    console.log("📋 Saving task with formChecklists:", taskData.formChecklists);

    if (
      taskData.taskMode === "default" &&
      (taskData.monthlyWindowFrom === null || taskData.monthlyWindowTo === null)
    ) {
      return res.status(400).json({
        success: false,
        message: "Default task requires monthly window (from/to day)",
      });
    }
    if (
      taskData.taskMode === "default" &&
      taskData.monthlyWindowFrom > taskData.monthlyWindowTo
    ) {
      return res.status(400).json({
        success: false,
        message: "Monthly window start day cannot be greater than end day",
      });
    }

    // ✅ Marketing aur Composite ke liye assignments field add karo
    if (type === "composite" || type === "marketing") {
      taskData.assignments = [];
    }

    const newTask = new TaskModel(taskData);
    await newTask.save();

    await newTask.populate("cat", "name");

    res.status(201).json({
      success: true,
      message: `${type} task created successfully`,
      task: newTask,
    });
  } catch (error) {
    console.error(`❌ Error creating ${req.body.type} task:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};
// TaskCtrl.js में getAllTasks function को update करें:
export const getAllTasks = async (req, res) => {
  try {
    const type = req.query.type || "composite";
    const status = req.query.status || "template"; // Default to template

    console.log(`📥 Fetching ${type} tasks with status: ${status}`);

    const TaskModel = GetModelByType(type);

    if (!TaskModel) {
      return res.status(400).json({
        success: false,
        message: `Invalid task type: ${type}`,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    // Build query
    let query = { status: "template" };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sub: { $regex: search, $options: "i" } },
        { depart: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      TaskModel.find(query)
        .populate("cat", "name category")
        .populate("assignments.employeeId", "name role employeeCode") // Populate assignments for both types
        .sort({ templatePriority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaskModel.countDocuments(query),
    ]);

    console.log(`✅ Found ${tasks.length} ${type} tasks`);

    // Format response
    const formattedTasks = tasks.map((task) => {
      const taskObj = task.toObject ? task.toObject() : task;
      return {
        ...taskObj,
        assignmentCount: taskObj.assignments?.length || 0,
        type: type, // Add type for frontend
      };
    });

    res.status(200).json({
      success: true,
      tasks: formattedTasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// ✅ Update task
export const updateTask = async (req, res) => {
  try {
    const type = req.body.type || "composite";
    const { id } = req.params;

    console.log(`🔄 Updating ${type} task: ${id}`);

    const TaskModel = GetModelByType(type);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await TaskModel.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Handle depart update
    let departArray = existingTask.depart;
    if (req.body.depart !== undefined) {
      if (Array.isArray(req.body.depart)) {
        departArray = req.body.depart;
      } else if (typeof req.body.depart === "string") {
        departArray = req.body.depart.split(",");
      }
    }

    // Prepare updates
    const updates = {
      ...(req.body.cat && { cat: req.body.cat }),
      ...(req.body.sub && { sub: req.body.sub }),
      depart: departArray,
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.estimatedDays && {
        estimatedDays: parseInt(req.body.estimatedDays),
      }),
      ...(req.body.templatePriority && {
        templatePriority: req.body.templatePriority,
      }),
      ...(req.body.taskMode && {
        taskMode: req.body.taskMode === "default" ? "default" : "assigned",
      }),
      ...(req.body.monthlyWindowFrom !== undefined && {
        monthlyWindowFrom: req.body.monthlyWindowFrom
          ? parseInt(req.body.monthlyWindowFrom, 10)
          : null,
      }),
      ...(req.body.monthlyWindowTo !== undefined && {
        monthlyWindowTo: req.body.monthlyWindowTo
          ? parseInt(req.body.monthlyWindowTo, 10)
          : null,
      }),
      ...(req.body.taskMode && {
        taskMode: req.body.taskMode === "default" ? "default" : "assigned",
      }),
      ...(req.body.monthlyWindowFrom !== undefined && {
        monthlyWindowFrom: req.body.monthlyWindowFrom
          ? parseInt(req.body.monthlyWindowFrom, 10)
          : null,
      }),
      ...(req.body.monthlyWindowTo !== undefined && {
        monthlyWindowTo: req.body.monthlyWindowTo
          ? parseInt(req.body.monthlyWindowTo, 10)
          : null,
      }),
      ...(req.body.email_descp !== undefined && {
        email_descp: req.body.email_descp,
      }),
      ...(req.body.sms_descp !== undefined && {
        sms_descp: req.body.sms_descp,
      }),
      ...(req.body.whatsapp_descp !== undefined && {
        whatsapp_descp: req.body.whatsapp_descp,
      }),
      ...(req.body.status && { status: req.body.status }),
      descp: {
        text: req.body.descpText || existingTask.descp.text,
        image: existingTask.descp.image,
      },
    };

    // Handle image update
    if (req.files?.image?.[0]) {
      updates.descp.image = req.files.image[0].filename;

      if (existingTask.descp.image) {
        try {
          await fs.unlink(
            path.join(__dirname, "../uploads", existingTask.descp.image)
          );
        } catch (err) {
          console.log("Old image file not found or already deleted");
        }
      }
    } else if (req.body.existingImage) {
      // Keep existing image if not changed
      updates.descp.image = req.body.existingImage;
    }

    // Handle checklists
    if (req.body.checklists !== undefined) {
      updates.checklists = Array.isArray(req.body.checklists)
        ? req.body.checklists.filter((item) => item && item.trim() !== "")
        : [];
    }

    // Handle formChecklists (composite update) with newDownloadIndices / newSampleIndices
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        let newDownloadIndices = [];
        let newSampleIndices = [];
        if (req.body.newDownloadIndices) {
          try {
            newDownloadIndices =
              typeof req.body.newDownloadIndices === "string"
                ? JSON.parse(req.body.newDownloadIndices)
                : req.body.newDownloadIndices;
          } catch (e) {}
        }
        if (req.body.newSampleIndices) {
          try {
            newSampleIndices =
              typeof req.body.newSampleIndices === "string"
                ? JSON.parse(req.body.newSampleIndices)
                : req.body.newSampleIndices;
          } catch (e) {}
        }
        const downloadFiles = req.files?.downloadFormUrl
          ? Array.isArray(req.files.downloadFormUrl)
            ? req.files.downloadFormUrl
            : [req.files.downloadFormUrl]
          : [];
        const sampleFiles = req.files?.sampleFormUrl
          ? Array.isArray(req.files.sampleFormUrl)
            ? req.files.sampleFormUrl
            : [req.files.sampleFormUrl]
          : [];

        updates.formChecklists = parsed
          .map((item, index) => {
            let downloadFormUrl = item.downloadFormUrl || "";
            let sampleFormUrl = item.sampleFormUrl || "";
            const di = newDownloadIndices.indexOf(index);
            if (di !== -1 && downloadFiles[di]) {
              const old = existingTask.formChecklists?.[index]?.downloadFormUrl;
              if (old) {
                try {
                  fs.unlink(path.join(__dirname, "../uploads", old));
                } catch (err) {}
              }
              downloadFormUrl = downloadFiles[di].filename;
            }
            const si = newSampleIndices.indexOf(index);
            if (si !== -1 && sampleFiles[si]) {
              const old = existingTask.formChecklists?.[index]?.sampleFormUrl;
              if (old) {
                try {
                  fs.unlink(path.join(__dirname, "../uploads", old));
                } catch (err) {}
              }
              sampleFormUrl = sampleFiles[si].filename;
            }
            return {
              name: item.name?.trim() || "",
              downloadFormUrl,
              sampleFormUrl,
            };
          })
          .filter((item) => item.name !== "");
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid formChecklists format",
        });
      }
    }
    const updated = await TaskModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("cat", "name category");

    console.log(`✅ ${type} task updated successfully`);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updated,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// TaskCtrl.js - assignCompositeTask function fix:
export const assignCompositeTask = async (req, res) => {
  try {
    const {
      taskId,
      assignments,
      assignedBy,
      clients = [],
      prospects = [],
      clientAssignmentRemarks = "",
      prospectAssignmentRemarks = "",
    } = req.body;

    console.log(
      `🎯 Assigning composite task ${taskId} to ${assignments.length} employees`
    );

    const CompositeTask = GetModelByType("composite");
    const IndividualTask = GetModelByType("individual");

    const task = await CompositeTask.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Composite task not found",
      });
    }

    // ✅ Validate clients/prospects if provided
    let validatedClients = [];
    let validatedProspects = [];

    if (clients.length > 0) {
      const clientDocs = await SusProsClient.find({
        _id: { $in: clients },
        status: "client",
      });
      validatedClients = clientDocs.map((c) => c._id);
    }

    if (prospects.length > 0) {
      const prospectDocs = await SusProsClient.find({
        _id: { $in: prospects },
        status: "prospect",
      });
      validatedProspects = prospectDocs.map((p) => p._id);
    }

    // Validate assignments
    const validAssignments = [];
    const errors = [];

    for (const assignment of assignments) {
      const { employeeId, employeeRole, priority, remarks, dueDate } =
        assignment;

      // ✅ FIX: Employee variable ko pehle find karo
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        errors.push(`Employee ${employeeId} not found`);
        continue;
      }

      // ✅ FIX: Ab employee variable available hai
      if (employee.role !== employeeRole) {
        errors.push(`Employee ${employee.name} is not a ${employeeRole}`);
        continue;
      }

      validAssignments.push({
        employeeId,
        employeeRole,
        assignedBy,
        assignedAt: new Date(),
        priority: priority || task.templatePriority || "medium",
        remarks: remarks || "",
        dueDate:
          task.taskMode === "default"
            ? null
            : dueDate
            ? new Date(dueDate)
            : new Date(
                Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000
              ),
        status: "pending",
        taskMode: task.taskMode || "assigned",
        monthlyWindowFrom: task.monthlyWindowFrom ?? null,
        monthlyWindowTo: task.monthlyWindowTo ?? null,
        // ✅ NEW: Add client/prospect references to each assignment
        assignedClients: validatedClients,
        assignedProspects: validatedProspects,
        clientAssignmentRemarks,
        prospectAssignmentRemarks,
      });
    }

    if (validAssignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid assignments found",
        errors,
      });
    }

    // ✅ Update composite task - assignments array mein add karo
    task.assignments = [...(task.assignments || []), ...validAssignments];

    // ✅ NEW: Also store client/prospect references at task level
    if (validatedClients.length > 0 || validatedProspects.length > 0) {
      task.assignedClients = [
        ...new Set([...(task.assignedClients || []), ...validatedClients]),
      ];
      task.assignedProspects = [
        ...new Set([...(task.assignedProspects || []), ...validatedProspects]),
      ];
    }

    await task.save();

    // Create individual tasks
    const individualTasks = [];
    for (const assignment of validAssignments) {
      // ✅ FIX: Employee details ke liye variable use karo
      const employee = await Employee.findById(assignment.employeeId);

      const individualTask = new IndividualTask({
        cat: task.cat,
        sub: task.sub,
        depart: [assignment.employeeRole],
        name: task.name,
        estimatedDays: task.estimatedDays,
        descp: task.descp,
        email_descp: task.email_descp,
        sms_descp: task.sms_descp,
        whatsapp_descp: task.whatsapp_descp,
        checklists: task.checklists,
        formChecklists: task.formChecklists,
        taskMode: task.taskMode || "assigned",
        monthlyWindowFrom: task.monthlyWindowFrom ?? null,
        monthlyWindowTo: task.monthlyWindowTo ?? null,
        status: "assigned",
        parentTask: taskId,
        assignedTo: assignment.employeeId,
        assignmentDetails: {
          priority: assignment.priority,
          remarks: assignment.remarks,
          dueDate: assignment.dueDate,
          assignedBy: assignment.assignedBy,
          assignedAt: assignment.assignedAt,
          // ✅ FIX: Ensure employee name is included
          assignedToName: employee?.name || "Unknown",
          // ✅ NEW: Add client/prospect data
          assignedClients: assignment.assignedClients,
          assignedProspects: assignment.assignedProspects,
          clientAssignmentRemarks: assignment.clientAssignmentRemarks,
          prospectAssignmentRemarks: assignment.prospectAssignmentRemarks,
        },
        createdBy: assignedBy,
      });

      await individualTask.save();
      individualTasks.push(individualTask._id);

      // ✅ OPTIONAL: Also update client/prospect documents with task reference
      if (assignment.assignedClients.length > 0) {
        await SusProsClient.updateMany(
          { _id: { $in: assignment.assignedClients } },
          {
            $addToSet: {
              taskHistory: {
                taskId: individualTask._id,
                taskName: task.name,
                taskType: "CompositeTask",
                assignedTo: assignment.employeeId,
                assignedToName: employee?.name || "Unknown",
                assignedAt: assignment.assignedAt,
                dueDate: assignment.dueDate,
                priority: assignment.priority,
                status: "pending",
                statusUpdates: [
                  {
                    status: "pending",
                    remarks: assignment.remarks || "Task assigned to employee",
                    updatedBy: assignedBy,
                    updatedByName: "System",
                    updatedAt: assignment.assignedAt,
                  },
                ],
                currentStatus: "pending",
                assignmentRemarks: assignment.remarks,
              },
            },
          }
        );
      }

      if (assignment.assignedProspects.length > 0) {
        await SusProsClient.updateMany(
          { _id: { $in: assignment.assignedProspects } },
          {
            $addToSet: {
              taskHistory: {
                taskId: individualTask._id,
                taskName: task.name,
                taskType: "CompositeTask",
                assignedTo: assignment.employeeId,
                assignedToName: employee?.name || "Unknown",
                assignedAt: assignment.assignedAt,
                dueDate: assignment.dueDate,
                priority: assignment.priority,
                status: "pending",
                statusUpdates: [
                  {
                    status: "pending",
                    remarks: assignment.remarks || "Task assigned to employee",
                    updatedBy: assignedBy,
                    updatedByName: "System",
                    updatedAt: assignment.assignedAt,
                  },
                ],
                currentStatus: "pending",
                assignmentRemarks: assignment.remarks,
              },
            },
          }
        );
      }
    }

    // 📱 Fire-and-forget: Send WhatsApp notifications to all assigned employees
    for (const assignment of validAssignments) {
      const emp = await Employee.findById(assignment.employeeId).select("name mobileNo officeMobile").lean();
      if (emp) {
        const assignerEmp = await Employee.findById(assignedBy).select("name").lean();
        notificationService.trigger("TASK_ASSIGNED", {
          recipientPhone: emp.officeMobile || emp.mobileNo,
          recipientName: emp.name,
          recipientId: emp._id,
          name: emp.name,
          taskName: task.name,
          dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString("en-IN") : "N/A",
          priority: assignment.priority || "medium",
          assignedBy: assignerEmp?.name || "Admin",
          remarks: assignment.remarks || "",
        }).catch(err => console.error("📱 Notification error (TASK_ASSIGNED):", err.message));
      }
    }

    res.status(200).json({
      success: true,
      message: `Task assigned to ${validAssignments.length} employee(s) ${
        validatedClients.length > 0
          ? `for ${validatedClients.length} client(s)`
          : ""
      } ${
        validatedProspects.length > 0
          ? `for ${validatedProspects.length} prospect(s)`
          : ""
      }`,
      data: {
        task: task,
        assignments: validAssignments,
        individualTaskIds: individualTasks,
        assignedClients: validatedClients,
        assignedProspects: validatedProspects,
      },
    });
  } catch (error) {
    console.error("❌ Error assigning composite task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign task",
      error: error.message,
    });
  }
};
// ✅ UPDATED: Get tasks by role - now checks array
export const getTasksByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const TaskModel = GetModelByType("composite");

    // ✅ Check if role is in depart array
    const tasks = await TaskModel.find({
      depart: { $in: [role] }, // ✅ Array me check karo
      status: { $in: ["template", "assigned"] },
    })
      .populate("cat", "name category")
      .sort({ templatePriority: -1, createdAt: -1 }) // ✅ Sort by priority
      .lean();

    // Format tasks with priority info
    const formattedTasks = tasks.map((task) => ({
      ...task,
      priority: task.templatePriority || "medium",
      roles: task.depart || [],
    }));

    res.status(200).json({
      success: true,
      message: `Tasks for ${role} fetched successfully`,
      data: {
        role,
        tasks: formattedTasks,
        count: formattedTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching tasks by role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// TaskCtrl.js - getAssignedTasks function mein YEH UPDATE KARO

export const getAssignedTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const TaskModel = GetModelByType("individual");

    // ✅ IMPORTANT: First find without populate
    const tasks = await TaskModel.find({
      assignedTo: employeeId,
      $or: [
        { status: { $in: ["assigned", "in-progress", "pending"] } },
        { taskMode: "default" },
      ],
    })
      .populate({
        path: "parentTask",
        select: "name type templatePriority checklists estimatedDays",
      })
      .populate("cat", "name")
      .populate(
        "assignmentDetails.assignedClients",
        "personalDetails.groupName personalDetails.mobileNo personalDetails.emailId status"
      )
      .populate(
        "assignmentDetails.assignedProspects",
        "personalDetails.groupName personalDetails.mobileNo personalDetails.emailId personalDetails.leadSource status"
      )
      .populate("assignmentDetails.assignedBy", "name email")
      .populate("createdBy", "name")
      .sort({
        "assignmentDetails.priority": -1,
        "assignmentDetails.dueDate": 1,
        createdAt: -1,
      })
      .lean();

    console.log(
      `✅ Found ${tasks.length} individual tasks for employee ${employeeId}`
    );

    // Format response with all necessary data
    const formattedTasks = tasks.map((task) => {
      // Get checklists
      const checklists = task.checklists || task.parentTask?.checklists || [];

      // Calculate checklist count
      const checklistCount = checklists.length;

      // Get priority
      const priority = task.assignmentDetails?.priority || "medium";

      // Get parent priority
      const parentPriority = task.parentTask?.templatePriority || "low";

      // ✅ Get client/prospect details
      const clientDetails = task.assignmentDetails?.assignedClients || [];
      const prospectDetails = task.assignmentDetails?.assignedProspects || [];
      const completionLogs = Array.isArray(task.defaultTaskCompletions)
        ? task.defaultTaskCompletions
        : [];
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      const completedMonthSet = new Set(
        completionLogs.map((entry) => entry.monthKey).filter(Boolean)
      );
      const pendingPreviousMonths = [];
      if (task.taskMode === "default") {
        const startDate = new Date(task.createdAt || now);
        startDate.setDate(1);
        const cursor = new Date(startDate);
        const guard = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        while (cursor < guard) {
          const key = `${cursor.getFullYear()}-${String(
            cursor.getMonth() + 1
          ).padStart(2, "0")}`;
          if (!completedMonthSet.has(key)) {
            pendingPreviousMonths.push(key);
          }
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }

      return {
        id: task._id,
        _id: task._id,
        name: task.name,
        company: task.sub,
        product: task.cat?.name,
        priority,
        dueDate: task.assignmentDetails?.dueDate,
        assignedAt: task.assignmentDetails?.assignedAt,
        remarks: task.assignmentDetails?.remarks,
        checklistCount,
        checklists,
        parentTask: task.parentTask,
        type: task.parentTask?.type || task.type,
        parentPriority,
        parentChecklists: task.parentTask?.checklists || [],
        status: task.status,
        estimatedDays:
          task.estimatedDays || task.parentTask?.estimatedDays || 1,
        taskMode: task.taskMode || "assigned",
        monthlyWindowFrom: task.monthlyWindowFrom ?? null,
        monthlyWindowTo: task.monthlyWindowTo ?? null,
        defaultTaskCompletions: completionLogs,
        currentMonthStatus: completedMonthSet.has(currentMonthKey)
          ? "completed"
          : "pending",
        pendingPreviousMonths,
        assignmentDetails: task.assignmentDetails || {},
        cat: task.cat || { name: "General" },
        // ✅ IMPORTANT: Yeh fields frontend ke liye
        assignedClients: clientDetails,
        assignedProspects: prospectDetails,
        clientCount: clientDetails.length,
        prospectCount: prospectDetails.length,
        // ✅ Forwarding chain
        forwardedFromRM: task.forwardedFromRM || null,
        oeForwardedToRM: task.oeForwardedToRM || null,
      };
    });

    res.status(200).json({
      success: true,
      message: "Assigned tasks fetched successfully",
      data: {
        tasks: formattedTasks,
        count: formattedTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching assigned tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned tasks",
      error: error.message,
    });
  }
};

// ✅ NEW: Get composite task templates for assignment
export const getCompositeTemplates = async (req, res) => {
  try {
    const TaskModel = GetModelByType("composite");

    const tasks = await TaskModel.find({
      status: "template",
    })
      .populate("cat", "name category")
      .sort({ templatePriority: -1, createdAt: -1 })
      .lean();

    // Filter out tasks with invalid depart arrays
    const validTasks = tasks.filter(
      (task) => Array.isArray(task.depart) && task.depart.length > 0
    );

    res.status(200).json({
      success: true,
      message: "Composite templates fetched successfully",
      data: {
        tasks: validTasks,
        count: validTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching composite templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

// ✅ NEW: Get tasks by employee role (updated for array)
export const getTasksByEmployeeRole = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 1. Find employee by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employeeRole = employee.role;
    const TaskModel = GetModelByType("composite");

    // ✅ Updated query for array
    const query = {
      depart: { $in: [employeeRole] }, // ✅ Check if role is in array
      status: "template",
    };

    // Find matching tasks
    const tasks = await TaskModel.find(query)
      .populate("cat", "name category")
      .sort({ templatePriority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          role: employee.role,
          employeeCode: employee.employeeCode,
          designation: employee.designation,
        },
        tasks: tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in getTasksByEmployeeRole:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// TaskCtrl.js - getTaskById function UPDATE

export const getTaskById = async (req, res) => {
  try {
    const type = req.query.type || "individual"; // Default individual rakh lo
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const TaskModel = GetModelByType(type);

    // ✅ DIFFERENT POPULATE FOR DIFFERENT TASK TYPES
    let query = TaskModel.findById(id);

    if (type === "composite" || type === "marketing" || type === "service") {
      // Composite/Marketing/Service tasks ke liye
      query = query
        .populate("cat", "name category description")
        .populate("assignments.employeeId", "name role employeeCode")
        .populate("assignments.assignedBy", "name")
        .populate("createdBy", "name");
    } else {
      // Individual task ke liye
      query = query
        .populate("cat", "name category description")
        .populate("assignedTo", "name role employeeCode email") // ✅ Yeh field IndividualTask mein hai
        .populate("assignmentDetails.assignedBy", "name email")
        .populate(
          "assignmentDetails.assignedClients",
          "personalDetails.groupName personalDetails.groupCode personalDetails.mobileNo personalDetails.emailId status"
        )
        .populate(
          "assignmentDetails.assignedProspects",
          "personalDetails.groupName personalDetails.groupCode personalDetails.mobileNo personalDetails.emailId personalDetails.leadSource status"
        )
        .populate("createdBy", "name")
        .populate("parentTask", "name templatePriority");
    }

    const task = await query;

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Format response based on type
    let formattedTask = task.toObject ? task.toObject() : task;

    if (type === "individual") {
      // Individual task ke liye extra formatting
      formattedTask = {
        ...formattedTask,
        // Ensure these arrays exist
        assignedClients: formattedTask.assignmentDetails?.assignedClients || [],
        assignedProspects:
          formattedTask.assignmentDetails?.assignedProspects || [],
        clientCount: (formattedTask.assignmentDetails?.assignedClients || [])
          .length,
        prospectCount: (
          formattedTask.assignmentDetails?.assignedProspects || []
        ).length,
        // Add client/prospect remarks
        clientAssignmentRemarks: formattedTask.clientAssignmentRemarks,
        prospectAssignmentRemarks: formattedTask.prospectAssignmentRemarks,
      };
    }

    res.status(200).json({
      success: true,
      task: formattedTask,
    });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: err.message,
    });
  }
};

// ✅ Delete task (with proper error handling)
export const deleteTask = async (req, res) => {
  try {
    const type = req.query.type || "composite";
    const { id } = req.params;

    console.log(`🗑️ Deleting ${type} task: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const TaskModel = GetModelByType(type);
    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete associated files
    const filesToDelete = [];

    if (task.descp && task.descp.image) {
      filesToDelete.push(task.descp.image);
    }

    if (task.formChecklists && Array.isArray(task.formChecklists)) {
      task.formChecklists.forEach((checklist) => {
        if (checklist.downloadFormUrl) {
          filesToDelete.push(checklist.downloadFormUrl);
        }
        if (checklist.sampleFormUrl) {
          filesToDelete.push(checklist.sampleFormUrl);
        }
      });
    }

    // Delete files asynchronously with better error handling
    for (const filename of filesToDelete) {
      try {
        if (filename) {
          const filePath = path.join(__dirname, "../uploads", filename);

          // Check if file exists before trying to delete
          if (fs.existsSync(filePath)) {
            await fs.unlink(filePath);
            console.log(`✅ Deleted file: ${filename}`);
          } else {
            console.log(
              `⚠️ File not found (already deleted or missing): ${filename}`
            );
          }
        }
      } catch (err) {
        console.error(`⚠️ Error deleting file ${filename}:`, err.message);
        // Don't fail the whole operation if file deletion fails
      }
    }

    // Also delete associated individual tasks if it's a composite task
    if (type === "composite" || type === "marketing" || type === "service") {
      const IndividualTask = GetModelByType("individual");
      try {
        const deleteResult = await IndividualTask.deleteMany({
          parentTask: id,
          type: type,
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} individual tasks`);
      } catch (err) {
        console.error("Error deleting individual tasks:", err.message);
      }
    }

    // Delete the main task
    await TaskModel.findByIdAndDelete(id);

    console.log(`✅ ${type} task deleted successfully: ${id}`);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: err.message,
    });
  }
};
// ✅ NEW: Assign marketing task (single employee only)
// TaskCtrl.js में नीचे दिए functions add करें:

// ✅ Marketing Templates Fetch
export const getMarketingTemplates = async (req, res) => {
  try {
    const MarketingTask = GetModelByType("marketing");

    const tasks = await MarketingTask.find({
      status: "template",
    })
      .populate("cat", "name category")
      .populate("assignments.employeeId", "name role employeeCode")
      .sort({ templatePriority: -1, createdAt: -1 })
      .lean();

    // Filter out tasks with invalid depart arrays
    const validTasks = tasks.filter(
      (task) => Array.isArray(task.depart) && task.depart.length > 0
    );

    // Format response with assignment counts
    const formattedTasks = validTasks.map((task) => ({
      ...task,
      assignmentCount: task.assignments?.length || 0,
    }));

    res.status(200).json({
      success: true,
      message: "Marketing templates fetched successfully",
      data: {
        tasks: formattedTasks,
        count: formattedTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching marketing templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketing templates",
      error: error.message,
    });
  }
};

// ✅ UPDATED: Assign Marketing Task with Client/Prospect Support
export const assignMarketingTask = async (req, res) => {
  try {
    const {
      taskId,
      employeeId,
      employeeRole,
      priority,
      remarks,
      dueDate,
      assignedBy,
      // ✅ NEW: Client/Prospect fields
      clients = [],
      prospects = [],
      clientAssignmentRemarks = "",
      prospectAssignmentRemarks = "",
    } = req.body;

    console.log(
      `🎯 Assigning marketing task ${taskId} to employee ${employeeId}`
    );

    console.log(
      `📊 Clients: ${clients.length}, Prospects: ${prospects.length}`
    );
    const MarketingTask = GetModelByType("marketing");
    const IndividualTask = GetModelByType("individual");

    const task = await MarketingTask.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Marketing task not found",
      });
    }

    // ✅ Validate clients/prospects if provided
    let validatedClients = [];
    let validatedProspects = [];

    if (clients.length > 0) {
      const clientDocs = await SusProsClient.find({
        _id: { $in: clients },
        status: "client",
      });
      validatedClients = clientDocs.map((c) => c._id);
    }

    if (prospects.length > 0) {
      const prospectDocs = await SusProsClient.find({
        _id: { $in: prospects },
        status: "prospect",
      });
      validatedProspects = prospectDocs.map((p) => p._id);
    }

    // Validate employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.role !== employeeRole) {
      return res.status(400).json({
        success: false,
        message: `Employee ${employee.name} is not a ${employeeRole}`,
      });
    }

    // // Check if employee is already assigned to this task
    // const alreadyAssigned = task.assignments?.some(
    //   (assignment) => assignment.employeeId.toString() === employeeId
    // );

    // if (alreadyAssigned) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Employee ${employee.name} is already assigned to this task`,
    //   });
    // }

    // Create assignment with client/prospect data
    const assignment = {
      employeeId,
      employeeRole,
      assignedBy,
      assignedAt: new Date(),
      priority: priority || task.templatePriority || "medium",
      remarks: remarks || "",
      dueDate:
        task.taskMode === "default"
          ? null
          : dueDate
          ? new Date(dueDate)
          : new Date(
              Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000
            ),
      status: "pending",
      taskMode: task.taskMode || "assigned",
      monthlyWindowFrom: task.monthlyWindowFrom ?? null,
      monthlyWindowTo: task.monthlyWindowTo ?? null,
      // ✅ NEW: Add client/prospect references
      assignedClients: validatedClients,
      assignedProspects: validatedProspects,
      clientAssignmentRemarks,
      prospectAssignmentRemarks,
    };

    // Update marketing task - assignments array में add करें
    task.assignments = [...(task.assignments || []), assignment];

    // ✅ NEW: Also store client/prospect references at task level
    if (validatedClients.length > 0 || validatedProspects.length > 0) {
      task.assignedClients = [
        ...new Set([...(task.assignedClients || []), ...validatedClients]),
      ];
      task.assignedProspects = [
        ...new Set([...(task.assignedProspects || []), ...validatedProspects]),
      ];
    }

    await task.save();

    // Create individual task with client/prospect data
    const individualTask = new IndividualTask({
      cat: task.cat,
      sub: task.sub,
      depart: [employeeRole],
      name: task.name,
      estimatedDays: task.estimatedDays,
      descp: task.descp,
      email_descp: task.email_descp,
      sms_descp: task.sms_descp,
      whatsapp_descp: task.whatsapp_descp,
      checklists: task.checklists,
      formChecklists: task.formChecklists,
      taskMode: task.taskMode || "assigned",
      monthlyWindowFrom: task.monthlyWindowFrom ?? null,
      monthlyWindowTo: task.monthlyWindowTo ?? null,
      status: "assigned",
      parentTask: taskId,
      assignedTo: employeeId,
      assignmentDetails: {
        priority: assignment.priority,
        remarks: assignment.remarks,
        dueDate: assignment.dueDate,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt,
        // ✅ NEW: Add client/prospect data
        assignedClients: validatedClients,
        assignedProspects: validatedProspects,
        clientAssignmentRemarks: assignment.clientAssignmentRemarks,
        prospectAssignmentRemarks: assignment.prospectAssignmentRemarks,
      },
      createdBy: assignedBy,
      type: "marketing",
    });

    await individualTask.save();

    // ✅ OPTIONAL: Also update client/prospect documents with task reference
    if (validatedClients.length > 0) {
      await SusProsClient.updateMany(
        { _id: { $in: validatedClients } },
        {
          $addToSet: {
            taskHistory: {
              taskId: individualTask._id,
              taskName: task.name,
              taskType: "MarketingTask",
              assignedTo: employeeId,
              assignedToName: employee.name,
              assignedAt: assignment.assignedAt,
              dueDate: assignment.dueDate,
              priority: assignment.priority,
              status: "pending",
              statusUpdates: [
                {
                  status: "pending",
                  remarks: assignment.remarks || "Marketing task assigned",
                  updatedBy: assignedBy,
                  updatedByName: "System",
                  updatedAt: assignment.assignedAt,
                },
              ],
              currentStatus: "pending",
              assignmentRemarks: assignment.remarks,
            },
          },
        }
      );
    }

    if (validatedProspects.length > 0) {
      await SusProsClient.updateMany(
        { _id: { $in: validatedProspects } },
        {
          $addToSet: {
            taskHistory: {
              taskId: individualTask._id,
              taskName: task.name,
              taskType: "MarketingTask",
              assignedTo: employeeId,
              assignedToName: employee.name,
              assignedAt: assignment.assignedAt,
              dueDate: assignment.dueDate,
              priority: assignment.priority,
              status: "pending",
              statusUpdates: [
                {
                  status: "pending",
                  remarks: assignment.remarks || "Marketing task assigned",
                  updatedBy: assignedBy,
                  updatedByName: "System",
                  updatedAt: assignment.assignedAt,
                },
              ],
              currentStatus: "pending",
              assignmentRemarks: assignment.remarks,
            },
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Marketing task assigned to ${employee.name} ${
        validatedClients.length > 0
          ? `for ${validatedClients.length} client(s)`
          : ""
      } ${
        validatedProspects.length > 0
          ? `for ${validatedProspects.length} prospect(s)`
          : ""
      }`,
      data: {
        task: task,
        assignment: assignment,
        individualTaskId: individualTask._id,
        assignedClients: validatedClients,
        assignedProspects: validatedProspects,
      },
    });
  } catch (error) {
    console.error("❌ Error assigning marketing task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign marketing task",
      error: error.message,
    });
  }
};

// ✅ Marketing Tasks by Employee Role
export const getMarketingTasksByEmployeeRole = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 1. Find employee by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employeeRole = employee.role;
    const MarketingTask = GetModelByType("marketing");

    // Find tasks where employee's role is in depart array
    const query = {
      depart: { $in: [employeeRole] },
      status: "template",
    };

    // Find matching tasks
    const tasks = await MarketingTask.find(query)
      .populate("cat", "name category")
      .populate("assignments.employeeId", "name")
      .sort({ templatePriority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Marketing tasks fetched successfully",
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          role: employee.role,
          employeeCode: employee.employeeCode,
          designation: employee.designation,
        },
        tasks: tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in getMarketingTasksByEmployeeRole:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching marketing tasks",
      error: error.message,
    });
  }
};

// ✅ Assigned Marketing Tasks for Employee
export const getAssignedMarketingTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const IndividualTask = GetModelByType("individual");

    // Find individual tasks assigned to this employee
    const tasks = await IndividualTask.find({
      assignedTo: employeeId,
      type: "marketing",
      status: { $in: ["assigned", "in-progress", "pending"] },
    })
      .populate({
        path: "parentTask",
        select: "name templatePriority checklists estimatedDays assignments",
        model: "MarketingTask",
      })
      .populate("cat", "name")
      .sort({
        "assignmentDetails.priority": -1,
        "assignmentDetails.dueDate": 1,
        createdAt: -1,
      })
      .lean();

    // Format response
    const formattedTasks = tasks.map((task) => {
      const checklists = task.checklists || task.parentTask?.checklists || [];
      const priority = task.assignmentDetails?.priority || "medium";

      return {
        id: task._id,
        name: task.name,
        company: task.sub,
        product: task.cat?.name,
        priority,
        dueDate: task.assignmentDetails?.dueDate,
        assignedAt: task.assignmentDetails?.assignedAt,
        remarks: task.assignmentDetails?.remarks,
        checklistCount: checklists.length,
        checklists,
        parentTask: task.parentTask?.name,
        parentPriority: task.parentTask?.templatePriority || "low",
        status: task.status,
        estimatedDays:
          task.estimatedDays || task.parentTask?.estimatedDays || 1,
        assignmentDetails: task.assignmentDetails || {},
        type: "marketing",
      };
    });

    res.status(200).json({
      success: true,
      message: "Assigned marketing tasks fetched successfully",
      data: {
        tasks: formattedTasks,
        count: formattedTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching assigned marketing tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned marketing tasks",
      error: error.message,
    });
  }
};

// ✅ Marketing Task Statistics
export const getMarketingTaskStats = async (req, res) => {
  try {
    const MarketingTask = GetModelByType("marketing");
    const IndividualTask = GetModelByType("individual");

    const [
      totalTemplates,
      totalAssigned,
      pendingAssignments,
      completedAssignments,
      tasksByPriority,
    ] = await Promise.all([
      MarketingTask.countDocuments({ status: "template" }),
      IndividualTask.countDocuments({ type: "marketing", status: "assigned" }),
      IndividualTask.countDocuments({
        type: "marketing",
        status: { $in: ["assigned", "pending"] },
      }),
      IndividualTask.countDocuments({
        type: "marketing",
        status: "completed",
      }),
      MarketingTask.aggregate([
        { $match: { status: "template" } },
        {
          $group: {
            _id: "$templatePriority",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format priority stats
    const priorityStats = {};
    tasksByPriority.forEach((stat) => {
      priorityStats[stat._id || "medium"] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: "Marketing task statistics fetched successfully",
      data: {
        stats: {
          totalTemplates,
          totalAssigned,
          pendingAssignments,
          completedAssignments,
          priorityStats,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching marketing task stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketing task statistics",
      error: error.message,
    });
  }
};

// ✅ Get Marketing Task by ID
export const getMarketingTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const MarketingTask = GetModelByType("marketing");
    const task = await MarketingTask.findById(id)
      .populate("cat", "name category description")
      .populate("assignments.employeeId", "name role employeeCode")
      .populate("assignments.assignedBy", "name")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Marketing task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Marketing task fetched successfully",
      task,
    });
  } catch (err) {
    console.error("Error fetching marketing task:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketing task",
      error: err.message,
    });
  }
};

// ✅ Update Marketing Task
export const updateMarketingTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const MarketingTask = GetModelByType("marketing");
    const existingTask = await MarketingTask.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Marketing task not found",
      });
    }

    // Handle depart update
    let departArray = existingTask.depart;
    if (req.body.depart !== undefined) {
      if (Array.isArray(req.body.depart)) {
        departArray = req.body.depart;
      } else if (typeof req.body.depart === "string") {
        departArray = req.body.depart.split(",");
      }
    }

    // Prepare updates
    const updates = {
      ...(req.body.cat && { cat: req.body.cat }),
      ...(req.body.sub && { sub: req.body.sub }),
      depart: departArray,
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.estimatedDays && {
        estimatedDays: parseInt(req.body.estimatedDays),
      }),
      ...(req.body.templatePriority && {
        templatePriority: req.body.templatePriority,
      }),
      ...(req.body.taskMode && {
        taskMode: req.body.taskMode === "default" ? "default" : "assigned",
      }),
      ...(req.body.monthlyWindowFrom !== undefined && {
        monthlyWindowFrom: req.body.monthlyWindowFrom
          ? parseInt(req.body.monthlyWindowFrom, 10)
          : null,
      }),
      ...(req.body.monthlyWindowTo !== undefined && {
        monthlyWindowTo: req.body.monthlyWindowTo
          ? parseInt(req.body.monthlyWindowTo, 10)
          : null,
      }),
      ...(req.body.email_descp !== undefined && {
        email_descp: req.body.email_descp,
      }),
      ...(req.body.sms_descp !== undefined && {
        sms_descp: req.body.sms_descp,
      }),
      ...(req.body.whatsapp_descp !== undefined && {
        whatsapp_descp: req.body.whatsapp_descp,
      }),
      descp: {
        text: req.body.descpText || existingTask.descp.text,
        image: existingTask.descp.image,
      },
    };

    // Handle image update
    if (req.files?.image?.[0]) {
      updates.descp.image = req.files.image[0].filename;

      if (existingTask.descp.image) {
        try {
          await fs.unlink(
            path.join(__dirname, "../uploads", existingTask.descp.image)
          );
        } catch (err) {
          console.log("Old image file not found or already deleted");
        }
      }
    } else if (req.body.existingImage) {
      updates.descp.image = req.body.existingImage;
    }

    // Handle checklists
    if (req.body.checklists !== undefined) {
      updates.checklists = Array.isArray(req.body.checklists)
        ? req.body.checklists.filter((item) => item && item.trim() !== "")
        : [];
    }

    // Handle formChecklists with newDownloadIndices / newSampleIndices (marketing)
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        let newDownloadIndices = [];
        let newSampleIndices = [];
        if (req.body.newDownloadIndices) {
          try {
            newDownloadIndices =
              typeof req.body.newDownloadIndices === "string"
                ? JSON.parse(req.body.newDownloadIndices)
                : req.body.newDownloadIndices;
          } catch (e) {}
        }
        if (req.body.newSampleIndices) {
          try {
            newSampleIndices =
              typeof req.body.newSampleIndices === "string"
                ? JSON.parse(req.body.newSampleIndices)
                : req.body.newSampleIndices;
          } catch (e) {}
        }
        const downloadFiles = req.files?.downloadFormUrl
          ? Array.isArray(req.files.downloadFormUrl)
            ? req.files.downloadFormUrl
            : [req.files.downloadFormUrl]
          : [];
        const sampleFiles = req.files?.sampleFormUrl
          ? Array.isArray(req.files.sampleFormUrl)
            ? req.files.sampleFormUrl
            : [req.files.sampleFormUrl]
          : [];

        updates.formChecklists = parsed
          .map((item, index) => {
            let downloadFormUrl = item.downloadFormUrl || "";
            let sampleFormUrl = item.sampleFormUrl || "";
            const di = newDownloadIndices.indexOf(index);
            if (di !== -1 && downloadFiles[di]) {
              const old = existingTask.formChecklists?.[index]?.downloadFormUrl;
              if (old) {
                try {
                  fs.unlink(path.join(__dirname, "../uploads", old));
                } catch (err) {}
              }
              downloadFormUrl = downloadFiles[di].filename;
            }
            const si = newSampleIndices.indexOf(index);
            if (si !== -1 && sampleFiles[si]) {
              const old = existingTask.formChecklists?.[index]?.sampleFormUrl;
              if (old) {
                try {
                  fs.unlink(path.join(__dirname, "../uploads", old));
                } catch (err) {}
              }
              sampleFormUrl = sampleFiles[si].filename;
            }
            return {
              name: item.name?.trim() || "",
              downloadFormUrl,
              sampleFormUrl,
            };
          })
          .filter((item) => item.name !== "");
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid formChecklists format",
        });
      }
    }

    const updated = await MarketingTask.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("cat", "name category");

    res.status(200).json({
      success: true,
      message: "Marketing task updated successfully",
      task: updated,
    });
  } catch (error) {
    console.error("❌ Update marketing task error:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// ✅ Delete Marketing Task
export const deleteMarketingTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const MarketingTask = GetModelByType("marketing");
    const task = await MarketingTask.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Marketing task not found",
      });
    }

    // Delete associated files
    const filesToDelete = [];
    if (task.descp.image) filesToDelete.push(task.descp.image);

    task.formChecklists.forEach((checklist) => {
      if (checklist.downloadFormUrl)
        filesToDelete.push(checklist.downloadFormUrl);
      if (checklist.sampleFormUrl) filesToDelete.push(checklist.sampleFormUrl);
    });

    // Delete files asynchronously
    filesToDelete.forEach(async (filename) => {
      try {
        await fs.unlink(path.join(__dirname, "../uploads", filename));
      } catch (err) {
        console.log(`File ${filename} not found or already deleted`);
      }
    });

    // Also delete associated individual tasks
    const IndividualTask = GetModelByType("individual");
    await IndividualTask.deleteMany({
      parentTask: id,
      type: "marketing",
    });

    await MarketingTask.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Marketing task deleted successfully",
    });
  } catch (err) {
    console.error("Delete marketing task error:", err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};
// TaskCtrl.js में नीचे दिए functions add करें:

// ✅ Service Templates Fetch
export const getServiceTemplates = async (req, res) => {
  try {
    const ServiceTask = GetModelByType("service");

    const tasks = await ServiceTask.find({
      status: "template",
    })
      .populate("cat", "name category")
      .populate("assignments.employeeId", "name role employeeCode")
      .sort({ templatePriority: -1, createdAt: -1 })
      .lean();

    // Filter out tasks with invalid depart arrays
    const validTasks = tasks.filter(
      (task) => Array.isArray(task.depart) && task.depart.length > 0
    );

    // Format response with assignment counts
    const formattedTasks = validTasks.map((task) => ({
      ...task,
      assignmentCount: task.assignments?.length || 0,
    }));

    res.status(200).json({
      success: true,
      message: "Service templates fetched successfully",
      data: {
        tasks: formattedTasks,
        count: formattedTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching service templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service templates",
      error: error.message,
    });
  }
};

// ✅ UPDATED: Assign Service Task with Client/Prospect Support
export const assignServiceTask = async (req, res) => {
  try {
    const {
      taskId,
      employeeId,
      employeeRole,
      priority,
      remarks,
      dueDate,
      assignedBy,
      // ✅ NEW: Client/Prospect fields
      clients = [],
      prospects = [],
      clientAssignmentRemarks = "",
      prospectAssignmentRemarks = "",
    } = req.body;

    console.log(
      `🎯 Assigning service task ${taskId} to employee ${employeeId}`
    );

    const ServiceTask = GetModelByType("service");
    const IndividualTask = GetModelByType("individual");

    const task = await ServiceTask.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Service task not found",
      });
    }

    // ✅ Validate clients/prospects if provided
    let validatedClients = [];
    let validatedProspects = [];

    if (clients.length > 0) {
      const clientDocs = await SusProsClient.find({
        _id: { $in: clients },
        status: "client",
      });
      validatedClients = clientDocs.map((c) => c._id);
    }

    if (prospects.length > 0) {
      const prospectDocs = await SusProsClient.find({
        _id: { $in: prospects },
        status: "prospect",
      });
      validatedProspects = prospectDocs.map((p) => p._id);
    }

    // Validate employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.role !== employeeRole) {
      return res.status(400).json({
        success: false,
        message: `Employee ${employee.name} is not a ${employeeRole}`,
      });
    }

    // // Check if employee is already assigned to this task
    // const alreadyAssigned = task.assignments?.some(
    //   (assignment) => assignment.employeeId.toString() === employeeId
    // );

    // if (alreadyAssigned) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Employee ${employee.name} is already assigned to this task`,
    //   });
    // }

    // Create assignment with client/prospect data
    const assignment = {
      employeeId,
      employeeRole,
      assignedBy,
      assignedAt: new Date(),
      priority: priority || task.templatePriority || "medium",
      remarks: remarks || "",
      dueDate:
        task.taskMode === "default"
          ? null
          : dueDate
          ? new Date(dueDate)
          : new Date(
              Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000
            ),
      status: "pending",
      taskMode: task.taskMode || "assigned",
      monthlyWindowFrom: task.monthlyWindowFrom ?? null,
      monthlyWindowTo: task.monthlyWindowTo ?? null,
      // ✅ NEW: Add client/prospect references
      assignedClients: validatedClients,
      assignedProspects: validatedProspects,
      clientAssignmentRemarks,
      prospectAssignmentRemarks,
    };

    // Update service task - assignments array में add करें
    task.assignments = [...(task.assignments || []), assignment];

    // ✅ NEW: Also store client/prospect references at task level
    if (validatedClients.length > 0 || validatedProspects.length > 0) {
      task.assignedClients = [
        ...new Set([...(task.assignedClients || []), ...validatedClients]),
      ];
      task.assignedProspects = [
        ...new Set([...(task.assignedProspects || []), ...validatedProspects]),
      ];
    }

    await task.save();

    // Create individual task with client/prospect data
    const individualTask = new IndividualTask({
      cat: task.cat,
      sub: task.sub,
      depart: [employeeRole],
      name: task.name,
      estimatedDays: task.estimatedDays,
      descp: task.descp,
      email_descp: task.email_descp,
      sms_descp: task.sms_descp,
      whatsapp_descp: task.whatsapp_descp,
      checklists: task.checklists,
      formChecklists: task.formChecklists,
      taskMode: task.taskMode || "assigned",
      monthlyWindowFrom: task.monthlyWindowFrom ?? null,
      monthlyWindowTo: task.monthlyWindowTo ?? null,
      status: "assigned",
      parentTask: taskId,
      assignedTo: employeeId,
      assignmentDetails: {
        priority: assignment.priority,
        remarks: assignment.remarks,
        dueDate: assignment.dueDate,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt,
        // ✅ NEW: Add client/prospect data
        assignedClients: validatedClients,
        assignedProspects: validatedProspects,
        clientAssignmentRemarks: assignment.clientAssignmentRemarks,
        prospectAssignmentRemarks: assignment.prospectAssignmentRemarks,
      },
      createdBy: assignedBy,
      type: "service",
    });

    await individualTask.save();

    // ✅ OPTIONAL: Also update client/prospect documents with task reference
    if (validatedClients.length > 0) {
      await SusProsClient.updateMany(
        { _id: { $in: validatedClients } },
        {
          $addToSet: {
            taskHistory: {
              taskId: individualTask._id,
              taskName: task.name,
              taskType: "ServiceTask",
              assignedTo: employeeId,
              assignedToName: employee.name,
              assignedAt: assignment.assignedAt,
              dueDate: assignment.dueDate,
              priority: assignment.priority,
              status: "pending",
              statusUpdates: [
                {
                  status: "pending",
                  remarks: assignment.remarks || "Service task assigned",
                  updatedBy: assignedBy,
                  updatedByName: "System",
                  updatedAt: assignment.assignedAt,
                },
              ],
              currentStatus: "pending",
              assignmentRemarks: assignment.remarks,
            },
          },
        }
      );
    }

    if (validatedProspects.length > 0) {
      await SusProsClient.updateMany(
        { _id: { $in: validatedProspects } },
        {
          $addToSet: {
            taskHistory: {
              taskId: individualTask._id,
              taskName: task.name,
              taskType: "ServiceTask",
              assignedTo: employeeId,
              assignedToName: employee.name,
              assignedAt: assignment.assignedAt,
              dueDate: assignment.dueDate,
              priority: assignment.priority,
              status: "pending",
              statusUpdates: [
                {
                  status: "pending",
                  remarks: assignment.remarks || "Service task assigned",
                  updatedBy: assignedBy,
                  updatedByName: "System",
                  updatedAt: assignment.assignedAt,
                },
              ],
              currentStatus: "pending",
              assignmentRemarks: assignment.remarks,
            },
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Service task assigned to ${employee.name} ${
        validatedClients.length > 0
          ? `for ${validatedClients.length} client(s)`
          : ""
      } ${
        validatedProspects.length > 0
          ? `for ${validatedProspects.length} prospect(s)`
          : ""
      }`,
      data: {
        task: task,
        assignment: assignment,
        individualTaskId: individualTask._id,
        assignedClients: validatedClients,
        assignedProspects: validatedProspects,
      },
    });
  } catch (error) {
    console.error("❌ Error assigning service task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign service task",
      error: error.message,
    });
  }
};

// ✅ Service Tasks by Employee Role
export const getServiceTasksByEmployeeRole = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 1. Find employee by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employeeRole = employee.role;
    const ServiceTask = GetModelByType("service");

    // Find tasks where employee's role is in depart array
    const query = {
      depart: { $in: [employeeRole] },
      status: "template",
    };

    // Find matching tasks
    const tasks = await ServiceTask.find(query)
      .populate("cat", "name category")
      .populate("assignments.employeeId", "name")
      .sort({ templatePriority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Service tasks fetched successfully",
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          role: employee.role,
          employeeCode: employee.employeeCode,
          designation: employee.designation,
        },
        tasks: tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in getServiceTasksByEmployeeRole:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching service tasks",
      error: error.message,
    });
  }
};

// ✅ Assigned Service Tasks for Employee
export const getAssignedServiceTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const IndividualTask = GetModelByType("individual");

    // Find individual tasks assigned to this employee
    const tasks = await IndividualTask.find({
      assignedTo: employeeId,
      type: "service",
      status: { $in: ["assigned", "in-progress", "pending"] },
    })
      .populate({
        path: "parentTask",
        select: "name templatePriority checklists estimatedDays assignments",
        model: "ServiceTask",
      })
      .populate("cat", "name")
      .sort({
        "assignmentDetails.priority": -1,
        "assignmentDetails.dueDate": 1,
        createdAt: -1,
      })
      .lean();

    // Format response
    const formattedTasks = tasks.map((task) => {
      const checklists = task.checklists || task.parentTask?.checklists || [];
      const priority = task.assignmentDetails?.priority || "medium";

      return {
        id: task._id,
        name: task.name,
        company: task.sub,
        product: task.cat?.name,
        priority,
        dueDate: task.assignmentDetails?.dueDate,
        assignedAt: task.assignmentDetails?.assignedAt,
        remarks: task.assignmentDetails?.remarks,
        checklistCount: checklists.length,
        checklists,
        parentTask: task.parentTask?.name,
        parentPriority: task.parentTask?.templatePriority || "low",
        status: task.status,
        estimatedDays:
          task.estimatedDays || task.parentTask?.estimatedDays || 1,
        assignmentDetails: task.assignmentDetails || {},
        type: "service",
      };
    });

    res.status(200).json({
      success: true,
      message: "Assigned service tasks fetched successfully",
      data: {
        tasks: formattedTasks,
        count: formattedTasks.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching assigned service tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned service tasks",
      error: error.message,
    });
  }
};

// ✅ Service Task Statistics
export const getServiceTaskStats = async (req, res) => {
  try {
    const ServiceTask = GetModelByType("service");
    const IndividualTask = GetModelByType("individual");

    const [
      totalTemplates,
      totalAssigned,
      pendingAssignments,
      completedAssignments,
      tasksByPriority,
    ] = await Promise.all([
      ServiceTask.countDocuments({ status: "template" }),
      IndividualTask.countDocuments({ type: "service", status: "assigned" }),
      IndividualTask.countDocuments({
        type: "service",
        status: { $in: ["assigned", "pending"] },
      }),
      IndividualTask.countDocuments({
        type: "service",
        status: "completed",
      }),
      ServiceTask.aggregate([
        { $match: { status: "template" } },
        {
          $group: {
            _id: "$templatePriority",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format priority stats
    const priorityStats = {};
    tasksByPriority.forEach((stat) => {
      priorityStats[stat._id || "medium"] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: "Service task statistics fetched successfully",
      data: {
        stats: {
          totalTemplates,
          totalAssigned,
          pendingAssignments,
          completedAssignments,
          priorityStats,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching service task stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service task statistics",
      error: error.message,
    });
  }
};

// ✅ Get Service Task by ID
export const getServiceTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const ServiceTask = GetModelByType("service");
    const task = await ServiceTask.findById(id)
      .populate("cat", "name category description")
      .populate("assignments.employeeId", "name role employeeCode")
      .populate("assignments.assignedBy", "name")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Service task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service task fetched successfully",
      task,
    });
  } catch (err) {
    console.error("Error fetching service task:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service task",
      error: err.message,
    });
  }
};

// ✅ Update Service Task
export const updateServiceTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const ServiceTask = GetModelByType("service");
    const existingTask = await ServiceTask.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Service task not found",
      });
    }

    // Handle depart update
    let departArray = existingTask.depart;
    if (req.body.depart !== undefined) {
      if (Array.isArray(req.body.depart)) {
        departArray = req.body.depart;
      } else if (typeof req.body.depart === "string") {
        departArray = req.body.depart.split(",");
      }
    }

    // Prepare updates
    const updates = {
      ...(req.body.cat && { cat: req.body.cat }),
      ...(req.body.sub && { sub: req.body.sub }),
      depart: departArray,
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.estimatedDays && {
        estimatedDays: parseInt(req.body.estimatedDays),
      }),
      ...(req.body.templatePriority && {
        templatePriority: req.body.templatePriority,
      }),
      ...(req.body.email_descp !== undefined && {
        email_descp: req.body.email_descp,
      }),
      ...(req.body.sms_descp !== undefined && {
        sms_descp: req.body.sms_descp,
      }),
      ...(req.body.whatsapp_descp !== undefined && {
        whatsapp_descp: req.body.whatsapp_descp,
      }),
      descp: {
        text: req.body.descpText || existingTask.descp.text,
        image: existingTask.descp.image,
      },
    };

    // Handle image update
    if (req.files?.image?.[0]) {
      updates.descp.image = req.files.image[0].filename;

      if (existingTask.descp.image) {
        try {
          await fs.unlink(
            path.join(__dirname, "../uploads", existingTask.descp.image)
          );
        } catch (err) {
          console.log("Old image file not found or already deleted");
        }
      }
    } else if (req.body.existingImage) {
      updates.descp.image = req.body.existingImage;
    }

    // Handle checklists
    if (req.body.checklists !== undefined) {
      updates.checklists = Array.isArray(req.body.checklists)
        ? req.body.checklists.filter((item) => item && item.trim() !== "")
        : [];
    }

    // Handle formChecklists with newDownloadIndices / newSampleIndices (service)
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        let newDownloadIndices = [];
        let newSampleIndices = [];
        if (req.body.newDownloadIndices) {
          try {
            newDownloadIndices =
              typeof req.body.newDownloadIndices === "string"
                ? JSON.parse(req.body.newDownloadIndices)
                : req.body.newDownloadIndices;
          } catch (e) {}
        }
        if (req.body.newSampleIndices) {
          try {
            newSampleIndices =
              typeof req.body.newSampleIndices === "string"
                ? JSON.parse(req.body.newSampleIndices)
                : req.body.newSampleIndices;
          } catch (e) {}
        }
        const downloadFiles = req.files?.downloadFormUrl
          ? Array.isArray(req.files.downloadFormUrl)
            ? req.files.downloadFormUrl
            : [req.files.downloadFormUrl]
          : [];
        const sampleFiles = req.files?.sampleFormUrl
          ? Array.isArray(req.files.sampleFormUrl)
            ? req.files.sampleFormUrl
            : [req.files.sampleFormUrl]
          : [];

        updates.formChecklists = parsed
          .map((item, index) => {
            let downloadFormUrl = item.downloadFormUrl || "";
            let sampleFormUrl = item.sampleFormUrl || "";
            const di = newDownloadIndices.indexOf(index);
            if (di !== -1 && downloadFiles[di]) {
              const old = existingTask.formChecklists?.[index]?.downloadFormUrl;
              if (old) {
                try {
                  fs.unlink(path.join(__dirname, "../uploads", old));
                } catch (err) {}
              }
              downloadFormUrl = downloadFiles[di].filename;
            }
            const si = newSampleIndices.indexOf(index);
            if (si !== -1 && sampleFiles[si]) {
              const old = existingTask.formChecklists?.[index]?.sampleFormUrl;
              if (old) {
                try {
                  fs.unlink(path.join(__dirname, "../uploads", old));
                } catch (err) {}
              }
              sampleFormUrl = sampleFiles[si].filename;
            }
            return {
              name: item.name?.trim() || "",
              downloadFormUrl,
              sampleFormUrl,
            };
          })
          .filter((item) => item.name !== "");
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid formChecklists format",
        });
      }
    }

    const updated = await ServiceTask.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("cat", "name category");

    res.status(200).json({
      success: true,
      message: "Service task updated successfully",
      task: updated,
    });
  } catch (error) {
    console.error("❌ Update service task error:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// ✅ Delete Service Task
export const deleteServiceTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const ServiceTask = GetModelByType("service");
    const task = await ServiceTask.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Service task not found",
      });
    }

    // Delete associated files
    const filesToDelete = [];
    if (task.descp.image) filesToDelete.push(task.descp.image);

    task.formChecklists.forEach((checklist) => {
      if (checklist.downloadFormUrl)
        filesToDelete.push(checklist.downloadFormUrl);
      if (checklist.sampleFormUrl) filesToDelete.push(checklist.sampleFormUrl);
    });

    // Delete files asynchronously
    filesToDelete.forEach(async (filename) => {
      try {
        await fs.unlink(path.join(__dirname, "../uploads", filename));
      } catch (err) {
        console.log(`File ${filename} not found or already deleted`);
      }
    });

    // Also delete associated individual tasks
    const IndividualTask = GetModelByType("individual");
    await IndividualTask.deleteMany({
      parentTask: id,
      type: "service",
    });

    await ServiceTask.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Service task deleted successfully",
    });
  } catch (err) {
    console.error("Delete service task error:", err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};

export const updateEntityTaskStatus = async (req, res) => {
  try {
    const { entityId, taskId } = req.params;
    const {
      status,
      remarks,
      employeeId, // ✅ REQUIRED: Frontend se bhejna hoga
      employeeName, // ✅ Optional: Employee name
      files = [],
    } = req.body;

    console.log(
      `🔄 Updating task ${taskId} status for entity ${entityId} to ${status} by employee: ${employeeId}`
    );

    // ✅ VALIDATE: Employee ID is REQUIRED
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID is required. Please provide employeeId in request body.",
      });
    }

    // 1. First, find the task
    const IndividualTask = GetModelByType("individual");
    const task = await IndividualTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if entity is assigned to this task
    let isClient = task.assignmentDetails?.assignedClients?.some(
      (id) => id.toString() === entityId
    );
    let isProspect = task.assignmentDetails?.assignedProspects?.some(
      (id) => id.toString() === entityId
    );
    let entityType = isClient ? "client" : isProspect ? "prospect" : null;

    // Default tasks can operate on RM allotted customers as fallback
    if (!isClient && !isProspect && task.taskMode === "default") {
      const entityDoc = await SusProsClient.findById(entityId)
        .select("status assignedToRM personalDetails.allocatedRM")
        .lean();

      const assignedRmId = task.assignedTo?.toString();
      const isAllottedByAssignedToRm =
        entityDoc?.assignedToRM &&
        assignedRmId &&
        entityDoc.assignedToRM.toString() === assignedRmId;
      const isAllottedByAllocatedRm =
        entityDoc?.personalDetails?.allocatedRM &&
        assignedRmId &&
        entityDoc.personalDetails.allocatedRM.toString() === assignedRmId;
      const isAllottedToThisRm =
        isAllottedByAssignedToRm || isAllottedByAllocatedRm;

      if (
        entityDoc &&
        isAllottedToThisRm &&
        (entityDoc.status === "client" || entityDoc.status === "prospect")
      ) {
        entityType = entityDoc.status;
        isClient = entityType === "client";
        isProspect = entityType === "prospect";

        // Keep task assignmentDetails in sync for future validations/reporting
        if (!task.assignmentDetails) {
          task.assignmentDetails = {};
        }
        if (!Array.isArray(task.assignmentDetails.assignedClients)) {
          task.assignmentDetails.assignedClients = [];
        }
        if (!Array.isArray(task.assignmentDetails.assignedProspects)) {
          task.assignmentDetails.assignedProspects = [];
        }
        if (
          isClient &&
          !task.assignmentDetails.assignedClients.some(
            (id) => id.toString() === entityId
          )
        ) {
          task.assignmentDetails.assignedClients.push(entityId);
        }
        if (
          isProspect &&
          !task.assignmentDetails.assignedProspects.some(
            (id) => id.toString() === entityId
          )
        ) {
          task.assignmentDetails.assignedProspects.push(entityId);
        }
      }
    }

    if (!isClient && !isProspect) {
      return res.status(400).json({
        success: false,
        message: "This entity is not assigned to this task",
      });
    }

    // 2. Update the task's status array
    const statusEntry = {
      entityId,
      entityType,
      status,
      remarks,
      updatedBy: employeeId, // ✅ Use employeeId from frontend
      updatedAt: new Date(),
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        uploadedAt: new Date(),
      })),
    };

    // Update or add status in task
    if (!task.clientProspectStatuses) {
      task.clientProspectStatuses = [];
    }

    const existingIndex = task.clientProspectStatuses.findIndex(
      (entry) => entry.entityId.toString() === entityId
    );

    if (existingIndex > -1) {
      task.clientProspectStatuses[existingIndex] = statusEntry;
    } else {
      task.clientProspectStatuses.push(statusEntry);
    }

    await task.save();

    // 3. Now update the client/prospect document with COMPLETE HISTORY
    const Employee = mongoose.model("Employee");

    // Get employee details (optional)
    const employee = await Employee.findById(employeeId)
      .select("name email")
      .lean();

    // First try to update existing task history entry
    const updateResult = await SusProsClient.findOneAndUpdate(
      {
        _id: entityId,
        "taskHistory.taskId": taskId,
      },
      {
        $push: {
          "taskHistory.$.statusUpdates": {
            status: status,
            remarks: remarks,
            updatedBy: employeeId,
            updatedByName: employee?.name || employeeName || "Employee",
            updatedAt: new Date(),
            files: files.map((file) => ({
              filename: file.filename,
              originalName: file.originalName,
              uploadedAt: new Date(),
            })),
          },
        },
        $set: {
          "taskHistory.$.currentStatus": status,
          "taskHistory.$.updatedAt": new Date(),
          ...(status === "completed" && {
            "taskHistory.$.completedAt": new Date(),
            "taskHistory.$.completionRemarks": remarks,
          }),
        },
      },
      { new: true }
    );

    // If task history doesn't exist, create it
    if (!updateResult) {
      // Get employee name who's assigned to the task
      const assignedEmployee = await Employee.findById(task.assignedTo)
        .select("name")
        .lean();

      await SusProsClient.findByIdAndUpdate(
        entityId,
        {
          $addToSet: {
            taskHistory: {
              taskId: taskId,
              taskName: task.name,
              taskType:
                task.type === "marketing"
                  ? "MarketingTask"
                  : task.type === "service"
                  ? "ServiceTask"
                  : "CompositeTask",
              assignedTo: task.assignedTo,
              assignedToName: assignedEmployee?.name || "Unknown",
              assignedAt: task.assignmentDetails?.assignedAt || new Date(),
              dueDate: task.assignmentDetails?.dueDate,
              priority: task.assignmentDetails?.priority || "medium",
              statusUpdates: [
                {
                  status: status,
                  remarks: remarks,
                  updatedBy: employeeId,
                  updatedByName: employee?.name || employeeName || "Employee",
                  updatedAt: new Date(),
                  files: files.map((file) => ({
                    filename: file.filename,
                    originalName: file.originalName,
                    uploadedAt: new Date(),
                  })),
                },
              ],
              currentStatus: status,
              ...(status === "completed" && {
                completedAt: new Date(),
                completionRemarks: remarks,
              }),
            },
          },
        },
        { new: true }
      );
    }

    // 4. Check if all entities are completed
    const allEntities = [
      ...(task.assignmentDetails?.assignedClients || []),
      ...(task.assignmentDetails?.assignedProspects || []),
    ];

    const completedEntities =
      task.clientProspectStatuses?.filter(
        (entry) => entry.status === "completed"
      ).length || 0;

    // Update task status if all entities completed
    if (completedEntities === allEntities.length && allEntities.length > 0) {
      task.status = "completed";
      task.completedAt = new Date();
      await task.save();
    }

    console.log(
      `✅ Task status updated for ${entityType} ${entityId} by employee ${employeeId}`
    );

    res.status(200).json({
      success: true,
      message: `Task status updated for ${entityType}`,
      data: {
        entityType,
        status,
        remarks,
        updatedBy: employeeId,
        updatedByName: employeeName || employee?.name || "Employee",
        updatedAt: new Date(),
        taskProgress: {
          completed: completedEntities,
          total: allEntities.length,
          percentage:
            allEntities.length > 0
              ? Math.round((completedEntities / allEntities.length) * 100)
              : 0,
        },
        task: {
          id: task._id,
          name: task.name,
          status: task.status,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error updating entity task status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

// TaskCtrl.js - getEntityTaskHistory function FIX KARO:

export const getEntityTaskHistory = async (req, res) => {
  try {
    const { entityId } = req.params;
    const {
      taskId,
      status,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = req.query;

    console.log(
      `📊 Fetching task history for entity: ${entityId}, taskId: ${taskId}`
    );

    const SusProsClient = mongoose.model("testSchema");

    // Build query
    let query = { _id: entityId };

    // Fetch the entity
    const entity = await SusProsClient.findById(entityId)
      .populate("taskHistory.assignedTo", "name email employeeCode")
      .populate("taskHistory.statusUpdates.updatedBy", "name email")
      .lean();

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Client/Prospect not found",
      });
    }

    let taskHistory = entity.taskHistory || [];

    // ✅ FIXED: Filter by taskId if provided
    if (taskId && taskId.trim() !== "") {
      taskHistory = taskHistory.filter((task) => {
        // Compare string representations
        const taskIdStr = task.taskId ? task.taskId.toString() : "";
        return taskIdStr === taskId.toString();
      });
    }

    // Apply other filters
    if (status && status.trim() !== "") {
      taskHistory = taskHistory.filter((task) => task.currentStatus === status);
    }

    if (startDate) {
      const start = new Date(startDate);
      taskHistory = taskHistory.filter(
        (task) => new Date(task.assignedAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      taskHistory = taskHistory.filter(
        (task) => new Date(task.assignedAt) <= end
      );
    }

    // Sort by latest update
    taskHistory.sort(
      (a, b) =>
        new Date(b.updatedAt || b.assignedAt) -
        new Date(a.updatedAt || a.assignedAt)
    );

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedHistory = taskHistory.slice(skip, skip + parseInt(limit));

    // Calculate statistics
    const stats = {
      totalTasks: taskHistory.length,
      completed: taskHistory.filter((t) => t.currentStatus === "completed")
        .length,
      pending: taskHistory.filter((t) => t.currentStatus === "pending").length,
      inProgress: taskHistory.filter((t) => t.currentStatus === "in-progress")
        .length,
      cancelled: taskHistory.filter((t) => t.currentStatus === "cancelled")
        .length,
      overdue: taskHistory.filter((t) => {
        if (!t.dueDate) return false;
        return (
          new Date(t.dueDate) < new Date() && t.currentStatus !== "completed"
        );
      }).length,
    };

    console.log(
      `✅ Found ${taskHistory.length} task history records for entity ${entityId}`
    );

    res.status(200).json({
      success: true,
      message: "Task history fetched successfully",
      data: {
        entity: {
          id: entity._id,
          name: entity.personalDetails?.name,
          type: entity.status,
          mobile: entity.personalDetails?.mobileNo,
          email: entity.personalDetails?.emailId,
          company: entity.personalDetails?.organisation,
        },
        taskHistory: paginatedHistory,
        stats,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(taskHistory.length / limit),
          totalItems: taskHistory.length,
          hasNext: skip + parseInt(limit) < taskHistory.length,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching entity task history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task history",
      error: error.message,
      stack: error.stack, // ✅ For debugging
    });
  }
};

// ✅ GET SPECIFIC TASK STATUS FOR ENTITY (ALSO FIX THIS ONE)
export const getEntityTaskStatus = async (req, res) => {
  try {
    const { entityId, taskId } = req.params;

    console.log(
      `🔍 Fetching task status for entity: ${entityId}, task: ${taskId}`
    );

    const SusProsClient = mongoose.model("testSchema");

    // ✅ FIXED: Find entity and filter taskHistory manually
    const entity = await SusProsClient.findById(entityId)
      .populate("taskHistory.assignedTo", "name email")
      .populate("taskHistory.statusUpdates.updatedBy", "name email")
      .lean();

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Client/Prospect not found",
      });
    }

    // Filter task history for specific task
    const taskHistory =
      entity.taskHistory?.filter((task) => {
        const taskIdStr = task.taskId ? task.taskId.toString() : "";
        return taskIdStr === taskId.toString();
      }) || [];

    if (taskHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found for this entity",
      });
    }

    const task = taskHistory[0];

    res.status(200).json({
      success: true,
      message: "Task status fetched successfully",
      data: {
        entity: {
          id: entity._id,
          name: entity.personalDetails?.name,
          type: entity.status,
          mobile: entity.personalDetails?.mobileNo,
        },
        task: task,
        currentStatus: task.currentStatus,
        latestUpdate:
          task.statusUpdates?.length > 0
            ? task.statusUpdates[task.statusUpdates.length - 1]
            : null,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching entity task status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task status",
      error: error.message,
    });
  }
};
// TaskCtrl.js mein yeh function add karo:

// TaskCtrl.js mein simple status update function:
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      status,
      remarks,
      employeeId,
      employeeName,
      monthKey,
      completedForClients = [],
      completedForProspects = [],
    } = req.body;

    console.log(`🔄 Updating task ${taskId} status to ${status}`);

    const IndividualTask = GetModelByType("individual");
    const task = await IndividualTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isDefaultTask = task.taskMode === "default";
    if (isDefaultTask && status === "completed") {
      const now = new Date();
      const resolvedMonthKey =
        monthKey ||
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const existingIndex = (task.defaultTaskCompletions || []).findIndex(
        (entry) => entry.monthKey === resolvedMonthKey
      );
      const completionEntry = {
        monthKey: resolvedMonthKey,
        completedAt: now,
        remarks: remarks || "",
        completedBy: employeeId || undefined,
        completedForClients: Array.isArray(completedForClients)
          ? completedForClients
          : [],
        completedForProspects: Array.isArray(completedForProspects)
          ? completedForProspects
          : [],
      };
      if (existingIndex >= 0) {
        task.defaultTaskCompletions[existingIndex] = completionEntry;
      } else {
        task.defaultTaskCompletions.push(completionEntry);
      }
      task.status = "assigned";
    } else {
      task.status = status;
      if (status === "completed") task.completedAt = new Date();
      if (remarks && task.assignmentDetails) {
        task.assignmentDetails.completionRemarks = remarks;
      }
    }

    await task.save();

    // 📱 Fire-and-forget: Notify on task completion
    if (status === "completed" && task.assignmentDetails?.assignedBy) {
      const assignedByEmp = await Employee.findById(task.assignmentDetails.assignedBy).select("name mobileNo officeMobile").lean();
      const completedByEmp = await Employee.findById(task.assignedTo).select("name").lean();
      if (assignedByEmp) {
        notificationService.trigger("TASK_COMPLETED", {
          recipientPhone: assignedByEmp.officeMobile || assignedByEmp.mobileNo,
          recipientName: assignedByEmp.name,
          recipientId: assignedByEmp._id,
          taskName: task.name,
          completedBy: completedByEmp?.name || "Employee",
          completedAt: new Date().toLocaleDateString("en-IN"),
          remarks: remarks || "No remarks",
        }).catch(err => console.error("📱 Notification error (TASK_COMPLETED):", err.message));
      }
    }

    res.status(200).json({
      success: true,
      message: `Task marked as ${status}`,
      task: {
        id: task._id,
        name: task.name,
        status: task.status,
        completedAt: task.completedAt,
        taskMode: task.taskMode || "assigned",
        defaultTaskCompletions: task.defaultTaskCompletions || [],
      },
    });
  } catch (error) {
    console.error("❌ Error updating task status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

// ✅ RM Complete + Forward to OE: mark RM task completed, create Individual task for OE
export const forwardTaskToOE = async (req, res) => {
  try {
    const { taskId, oeId, remark } = req.body;
    const rmId = req.body.rmId || req.body.employeeId;

    if (!taskId || !oeId || !rmId) {
      return res.status(400).json({
        success: false,
        message: "taskId, oeId and rmId are required",
      });
    }

    const IndividualTask = GetModelByType("individual");
    const CompositeTask = GetModelByType("composite");

    const rmTask = await IndividualTask.findById(taskId);
    if (!rmTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    if (rmTask.assignedTo?.toString() !== rmId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to forward this task",
      });
    }
    if ((rmTask.taskMode || "assigned") === "default") {
      return res.status(400).json({
        success: false,
        message: "Default tasks cannot be forwarded to OE",
      });
    }

    const oeEmployee = await Employee.findById(oeId);
    if (!oeEmployee || oeEmployee.role !== "OE") {
      return res.status(400).json({
        success: false,
        message: "Invalid OE selected",
      });
    }

    const parentTask = await CompositeTask.findById(rmTask.parentTask);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: "Parent task not found",
      });
    }

    rmTask.status = "completed";
    rmTask.completedAt = new Date();
    if (rmTask.assignmentDetails) rmTask.assignmentDetails.completionRemarks = req.body.completionRemarks || remark || "";
    await rmTask.save();

    const oeTask = new IndividualTask({
      cat: rmTask.cat,
      sub: rmTask.sub,
      depart: rmTask.depart,
      name: rmTask.name,
      estimatedDays: rmTask.estimatedDays,
      descp: rmTask.descp,
      email_descp: rmTask.email_descp,
      sms_descp: rmTask.sms_descp,
      whatsapp_descp: rmTask.whatsapp_descp,
      checklists: rmTask.checklists,
      formChecklists: rmTask.formChecklists || [],
      type: rmTask.type || "composite",
      status: "assigned",
      parentTask: rmTask.parentTask,
      assignedTo: oeId,
      assignmentDetails: {
        priority: rmTask.assignmentDetails?.priority || "medium",
        remarks: rmTask.assignmentDetails?.remarks,
        dueDate: rmTask.assignmentDetails?.dueDate,
        assignedBy: rmId,
        assignedAt: new Date(),
        assignedClients: rmTask.assignmentDetails?.assignedClients || [],
        assignedProspects: rmTask.assignmentDetails?.assignedProspects || [],
      },
      forwardedFromRM: {
        forwardedAt: new Date(),
        forwardedBy: rmId,
        remark: remark || "",
      },
      createdBy: rmId,
    });
    await oeTask.save();

    // 📱 Fire-and-forget: Notify OE about forwarded task
    notificationService.trigger("TASK_FORWARDED_TO_OE", {
      recipientPhone: oeEmployee.officeMobile || oeEmployee.mobileNo,
      recipientName: oeEmployee.name,
      recipientId: oeEmployee._id,
      name: oeEmployee.name,
      taskName: rmTask.name,
      forwardedBy: (await Employee.findById(rmId).select("name").lean())?.name || "RM",
      remark: remark || "No remark",
    }).catch(err => console.error("📱 Notification error (TASK_FORWARDED_TO_OE):", err.message));

    res.status(200).json({
      success: true,
      message: "Task completed and forwarded to OE",
      data: {
        rmTaskId: rmTask._id,
        oeTaskId: oeTask._id,
      },
    });
  } catch (error) {
    console.error("❌ Error in forwardTaskToOE:", error);
    res.status(500).json({
      success: false,
      message: "Failed to forward task to OE",
      error: error.message,
    });
  }
};

// ✅ Get assigned tasks for OE with forwardedFromRM and client/prospect details by oeType
export const getOEAssignedTasks = async (req, res) => {
  try {
    const oeId = req.query.oeId || req.params.oeId;
    if (!oeId) {
      return res.status(400).json({
        success: false,
        message: "oeId is required",
      });
    }

    const employee = await Employee.findById(oeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "OE not found",
      });
    }
    const oeType = employee.oeType || "inhouse";

    const IndividualTask = GetModelByType("individual");
    const clientSelect =
      oeType === "onfield"
        ? "personalDetails.name personalDetails.preferredMeetingArea personalDetails.mobileNo personalDetails.groupCode personalDetails.groupName personalDetails.familyHead status"
        : undefined;
    const tasks = await IndividualTask.find({
      assignedTo: oeId,
      status: { $in: ["assigned", "in-progress", "overdue"] },
    })
      .populate({
        path: "parentTask",
        select: "name type templatePriority checklists estimatedDays",
      })
      .populate("cat", "name")
      .populate("forwardedFromRM.forwardedBy", "name employeeCode")
      .populate(
        "assignmentDetails.assignedClients",
        clientSelect
      )
      .populate(
        "assignmentDetails.assignedProspects",
        clientSelect
      )
      .populate("assignmentDetails.assignedBy", "name email")
      .sort({ "assignmentDetails.priority": -1, "assignmentDetails.dueDate": 1, createdAt: -1 })
      .lean();

    const formattedTasks = tasks.map((task) => {
      const checklists = task.checklists || task.parentTask?.checklists || [];
      const clientDetails = task.assignmentDetails?.assignedClients || [];
      const prospectDetails = task.assignmentDetails?.assignedProspects || [];
      return {
        id: task._id,
        _id: task._id,
        name: task.name,
        company: task.sub,
        product: task.cat?.name,
        priority: task.assignmentDetails?.priority || "medium",
        dueDate: task.assignmentDetails?.dueDate,
        assignedAt: task.assignmentDetails?.assignedAt,
        remarks: task.assignmentDetails?.remarks,
        checklistCount: checklists.length,
        checklists,
        parentTask: task.parentTask,
        type: task.parentTask?.type || task.type || "composite",
        status: task.status,
        estimatedDays: task.estimatedDays || task.parentTask?.estimatedDays || 1,
        assignmentDetails: task.assignmentDetails || {},
        forwardedFromRM: task.forwardedFromRM || null,
        oeForwardedToRM: task.oeForwardedToRM || null,
        assignedClients: clientDetails,
        assignedProspects: prospectDetails,
        oeType,
      };
    });

    res.status(200).json({
      success: true,
      message: "OE assigned tasks fetched",
      data: formattedTasks,
    });
  } catch (error) {
    console.error("❌ Error getOEAssignedTasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch OE tasks",
      error: error.message,
    });
  }
};

// ✅ RM Forward to OE (Standalone - any status, no forced completion)
export const rmForwardToOE = async (req, res) => {
  try {
    const { taskId, oeId, remark, status } = req.body;
    const rmId = req.body.rmId || req.body.employeeId;

    if (!taskId || !oeId || !rmId) {
      return res.status(400).json({
        success: false,
        message: "taskId, oeId and rmId are required",
      });
    }

    const IndividualTask = GetModelByType("individual");

    const rmTask = await IndividualTask.findById(taskId)
      .populate("assignmentDetails.assignedClients", "personalDetails status")
      .populate("assignmentDetails.assignedProspects", "personalDetails status");

    if (!rmTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    if (rmTask.assignedTo?.toString() !== rmId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to forward this task" });
    }
    if ((rmTask.taskMode || "assigned") === "default") {
      return res.status(400).json({ success: false, message: "Default tasks cannot be forwarded to OE" });
    }

    const oeEmployee = await Employee.findById(oeId);
    if (!oeEmployee || oeEmployee.role !== "OE") {
      return res.status(400).json({ success: false, message: "Invalid OE selected" });
    }

    // Update RM task status if provided
    if (status && status !== "keep") {
      rmTask.status = status;
      if (status === "completed") rmTask.completedAt = new Date();
    }

    // Mark that it was forwarded from RM
    rmTask.forwardedFromRM = {
      forwardedAt: new Date(),
      forwardedBy: rmId,
      remark: remark || "",
    };
    await rmTask.save();

    // Create a new IndividualTask for OE with all client/prospect info
    const oeTask = new IndividualTask({
      cat: rmTask.cat,
      sub: rmTask.sub,
      depart: rmTask.depart,
      name: rmTask.name,
      estimatedDays: rmTask.estimatedDays,
      descp: rmTask.descp,
      email_descp: rmTask.email_descp,
      sms_descp: rmTask.sms_descp,
      whatsapp_descp: rmTask.whatsapp_descp,
      checklists: rmTask.checklists,
      formChecklists: rmTask.formChecklists || [],
      type: rmTask.type || "composite",
      taskMode: rmTask.taskMode || "assigned",
      status: "assigned",
      parentTask: rmTask.parentTask,
      assignedTo: oeId,
      assignmentDetails: {
        priority: rmTask.assignmentDetails?.priority || "medium",
        remarks: rmTask.assignmentDetails?.remarks,
        dueDate: rmTask.assignmentDetails?.dueDate,
        assignedBy: rmId,
        assignedAt: new Date(),
        assignedClients: rmTask.assignmentDetails?.assignedClients?.map
          ? rmTask.assignmentDetails.assignedClients.map((c) => c._id || c)
          : (rmTask.assignmentDetails?.assignedClients || []),
        assignedProspects: rmTask.assignmentDetails?.assignedProspects?.map
          ? rmTask.assignmentDetails.assignedProspects.map((p) => p._id || p)
          : (rmTask.assignmentDetails?.assignedProspects || []),
      },
      forwardedFromRM: {
        forwardedAt: new Date(),
        forwardedBy: rmId,
        remark: remark || "",
      },
      createdBy: rmId,
    });
    await oeTask.save();

    // 📱 Fire-and-forget: Notify OE about forwarded task (standalone forward)
    notificationService.trigger("TASK_FORWARDED_TO_OE", {
      recipientPhone: oeEmployee.officeMobile || oeEmployee.mobileNo,
      recipientName: oeEmployee.name,
      recipientId: oeEmployee._id,
      name: oeEmployee.name,
      taskName: rmTask.name,
      forwardedBy: (await Employee.findById(rmId).select("name").lean())?.name || "RM",
      remark: remark || "No remark",
    }).catch(err => console.error("📱 Notification error (TASK_FORWARDED_TO_OE):", err.message));

    res.status(200).json({
      success: true,
      message: `Task forwarded to OE (${oeEmployee.name}) successfully`,
      data: { rmTaskId: rmTask._id, oeTaskId: oeTask._id },
    });
  } catch (error) {
    console.error("❌ Error in rmForwardToOE:", error);
    res.status(500).json({ success: false, message: "Failed to forward task to OE", error: error.message });
  }
};

// ✅ OE forward back to RM (with RM picker - creates new IndividualTask for chosen RM)
export const oeForwardToRM = async (req, res) => {
  try {
    const { taskId, status, remark, rmId: targetRmId } = req.body;
    const oeId = req.body.oeId || req.body.employeeId;
    const files = req.body.files || req.files?.files || [];

    if (!taskId || !oeId) {
      return res.status(400).json({ success: false, message: "taskId and oeId are required" });
    }

    const IndividualTask = GetModelByType("individual");
    const task = await IndividualTask.findById(taskId)
      .populate("assignmentDetails.assignedClients", "personalDetails status")
      .populate("assignmentDetails.assignedProspects", "personalDetails status");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    if (task.assignedTo?.toString() !== oeId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to forward this task" });
    }

    // Update OE task status
    if (status) {
      task.status = status;
      if (status === "completed") task.completedAt = new Date();
    }
    if (task.assignmentDetails && remark) task.assignmentDetails.completionRemarks = remark;

    const fileList = Array.isArray(files) ? files : files.length ? [files] : [];
    const uploadedFiles = fileList.map((f) => ({
      filename: f.filename || f.name,
      originalName: f.originalname || f.name || f.filename,
      uploadedAt: new Date(),
    }));

    task.oeForwardedToRM = {
      forwardedAt: new Date(),
      remark: remark || "",
      files: [...(task.oeForwardedToRM?.files || []), ...uploadedFiles],
    };
    await task.save();

    // If a specific RM is selected, create a new task for that RM
    if (targetRmId) {
      const rmEmployee = await Employee.findById(targetRmId);
      if (!rmEmployee || rmEmployee.role !== "RM") {
        return res.status(400).json({ success: false, message: "Invalid RM selected" });
      }

      const rmTask = new IndividualTask({
        cat: task.cat,
        sub: task.sub,
        depart: task.depart,
        name: task.name,
        estimatedDays: task.estimatedDays,
        descp: task.descp,
        email_descp: task.email_descp,
        sms_descp: task.sms_descp,
        whatsapp_descp: task.whatsapp_descp,
        checklists: task.checklists,
        formChecklists: task.formChecklists || [],
        type: task.type || "composite",
        taskMode: task.taskMode || "assigned",
        status: "assigned",
        parentTask: task.parentTask,
        assignedTo: targetRmId,
        assignmentDetails: {
          priority: task.assignmentDetails?.priority || "medium",
          remarks: task.assignmentDetails?.remarks,
          dueDate: task.assignmentDetails?.dueDate,
          assignedBy: oeId,
          assignedAt: new Date(),
          assignedClients: task.assignmentDetails?.assignedClients?.map
            ? task.assignmentDetails.assignedClients.map((c) => c._id || c)
            : (task.assignmentDetails?.assignedClients || []),
          assignedProspects: task.assignmentDetails?.assignedProspects?.map
            ? task.assignmentDetails.assignedProspects.map((p) => p._id || p)
            : (task.assignmentDetails?.assignedProspects || []),
        },
        // Track OE → RM forwarding history
        oeForwardedToRM: {
          forwardedAt: new Date(),
          remark: remark || "",
          files: uploadedFiles,
        },
        createdBy: oeId,
      });
      await rmTask.save();

      // 📱 Fire-and-forget: Notify RM about forwarded task from OE
      notificationService.trigger("TASK_FORWARDED_TO_RM", {
        recipientPhone: rmEmployee.officeMobile || rmEmployee.mobileNo,
        recipientName: rmEmployee.name,
        recipientId: rmEmployee._id,
        name: rmEmployee.name,
        taskName: task.name,
        forwardedBy: (await Employee.findById(oeId).select("name").lean())?.name || "OE",
        remark: remark || "No remark",
      }).catch(err => console.error("📱 Notification error (TASK_FORWARDED_TO_RM):", err.message));

      return res.status(200).json({
        success: true,
        message: `Task forwarded to RM (${rmEmployee.name}) successfully`,
        data: { oeTaskId: task._id, rmTaskId: rmTask._id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated and forwarded",
      data: { taskId: task._id, status: task.status },
    });
  } catch (error) {
    console.error("❌ Error oeForwardToRM:", error);
    res.status(500).json({ success: false, message: "Failed to forward task to RM", error: error.message });
  }
};


// ✅ Employee Report List: OA panel jaisa - Telecaller/HR ke liye Telecaller & HR models se fetch
export const getEmployeeReportList = async (req, res) => {
  try {
    const { role, startDate, endDate } = req.query;
    const IndividualTask = GetModelByType("individual");
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000);

    let list = [];

    // OA panel jaisa: Telecaller role → Telecaller model se saare fetch karo (13 etc.)
    if (role === "Telecaller") {
      const telecallers = await Telecaller.find()
        .select("username employeeCode designation dateOfJoining employeeRef assignedSuspects")
        .lean();
      list = await Promise.all(
        telecallers.map(async (tc) => {
          const empId = tc.employeeRef || tc._id;
          const taskFilter = {
            assignedTo: empId,
            $or: [
              { "assignmentDetails.assignedAt": { $gte: start, $lte: end } },
              { completedAt: { $gte: start, $lte: end } },
            ],
          };
          const tasks = await IndividualTask.find(taskFilter)
            .select("name type status completedAt assignmentDetails.assignedAt assignmentDetails.dueDate")
            .lean();
          const completed = tasks.filter((t) => t.status === "completed").length;
          let assignedSuspectsCount = 0;
          if (Array.isArray(tc.assignedSuspects)) {
            assignedSuspectsCount = tc.assignedSuspects.filter((s) => {
              const d = s.assignedAt ? new Date(s.assignedAt) : null;
              return d && d >= start && d <= end;
            }).length;
          }
          return {
            _id: empId,
            name: tc.username,
            employeeCode: tc.employeeCode || `TC-${String(tc._id).slice(-4)}`,
            role: "Telecaller",
            designation: tc.designation || "Telecaller",
            oeType: undefined,
            dateOfJoining: tc.dateOfJoining,
            totalTasks: tasks.length,
            completedTasks: completed,
            pendingTasks: tasks.length - completed,
            assignedSuspectsCount,
            managedEmployeesCount: undefined,
          };
        })
      );
    }
    // OA panel jaisa: HR role → HR model se saare fetch karo
    else if (role === "HR") {
      const hrs = await HR.find()
        .select("username employeeCode designation dateOfJoining employeeRef managedEmployees")
        .lean();
      list = await Promise.all(
        hrs.map(async (hr) => {
          const empId = hr.employeeRef || hr._id;
          const taskFilter = {
            assignedTo: empId,
            $or: [
              { "assignmentDetails.assignedAt": { $gte: start, $lte: end } },
              { completedAt: { $gte: start, $lte: end } },
            ],
          };
          const tasks = await IndividualTask.find(taskFilter)
            .select("name type status completedAt assignmentDetails.assignedAt assignmentDetails.dueDate")
            .lean();
          const completed = tasks.filter((t) => t.status === "completed").length;
          let managedEmployeesCount = 0;
          if (Array.isArray(hr.managedEmployees)) {
            managedEmployeesCount = hr.managedEmployees.filter((m) => {
              const d = m.assignedDate ? new Date(m.assignedDate) : null;
              return d && d >= start && d <= end;
            }).length;
          }
          return {
            _id: empId,
            name: hr.username,
            employeeCode: hr.employeeCode || `HR-${String(hr._id).slice(-4)}`,
            role: "HR",
            designation: hr.designation || "HR Manager",
            oeType: undefined,
            dateOfJoining: hr.dateOfJoining,
            totalTasks: tasks.length,
            completedTasks: completed,
            pendingTasks: tasks.length - completed,
            assignedSuspectsCount: undefined,
            managedEmployeesCount,
          };
        })
      );
    }
    // Other roles / all: Employee schema se (pehle jaisa)
    else {
      const filter = {};
      if (role && role !== "all") filter.role = role;
      filter.$or = [
        { dateOfTermination: null },
        { dateOfTermination: { $exists: false } },
      ];
      const employees = await Employee.find(filter)
        .select("name employeeCode role designation oeType dateOfJoining")
        .sort({ role: 1, name: 1 })
        .lean();

      list = await Promise.all(
        employees.map(async (emp) => {
          const taskFilter = {
            assignedTo: emp._id,
            $or: [
              { "assignmentDetails.assignedAt": { $gte: start, $lte: end } },
              { completedAt: { $gte: start, $lte: end } },
            ],
          };
          const tasks = await IndividualTask.find(taskFilter)
            .select(
              "name type status completedAt assignmentDetails.assignedAt assignmentDetails.dueDate"
            )
            .lean();
          const completed = tasks.filter((t) => t.status === "completed").length;
          let assignedSuspectsCount = 0;
          let managedEmployeesCount = 0;
          if (emp.role === "Telecaller") {
            const telecallerDoc = await Telecaller.findOne({
              employeeRef: emp._id,
            }).lean();
            if (telecallerDoc && Array.isArray(telecallerDoc.assignedSuspects)) {
              assignedSuspectsCount = telecallerDoc.assignedSuspects.filter(
                (s) => {
                  const d = s.assignedAt ? new Date(s.assignedAt) : null;
                  return d && d >= start && d <= end;
                }
              ).length;
            }
          }
          if (emp.role === "HR") {
            const hrDoc = await HR.findOne({ employeeRef: emp._id }).lean();
            if (hrDoc && Array.isArray(hrDoc.managedEmployees)) {
              managedEmployeesCount = hrDoc.managedEmployees.filter((m) => {
                const d = m.assignedDate ? new Date(m.assignedDate) : null;
                return d && d >= start && d <= end;
              }).length;
            }
          }
          return {
            _id: emp._id,
            name: emp.name,
            employeeCode: emp.employeeCode,
            role: emp.role,
            designation: emp.designation,
            oeType: emp.oeType,
            dateOfJoining: emp.dateOfJoining,
            totalTasks: tasks.length,
            completedTasks: completed,
            pendingTasks: tasks.length - completed,
            assignedSuspectsCount: emp.role === "Telecaller" ? assignedSuspectsCount : undefined,
            managedEmployeesCount: emp.role === "HR" ? managedEmployeesCount : undefined,
          };
        })
      );
    }

    res.status(200).json({
      success: true,
      message: "Employee report list fetched",
      data: list,
    });
  } catch (error) {
    console.error("❌ getEmployeeReportList:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee report list",
      error: error.message,
    });
  }
};

// ✅ Employee Activity Report: Employee na mile to Telecaller/HR se resolve (OA panel align)
export const getEmployeeActivityReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000);

    let employee = await Employee.findById(employeeId)
      .select("name employeeCode role designation oeType")
      .lean();

    // Report list se Telecaller/HR _id aata hai (employeeRef ya model _id); agar Employee me nahi mila to Telecaller/HR se resolve karo
    if (!employee) {
      const tc = await Telecaller.findById(employeeId).lean();
      if (tc) {
        employee = {
          _id: tc.employeeRef || tc._id,
          name: tc.username,
          employeeCode: tc.employeeCode || `TC-${String(tc._id).slice(-4)}`,
          role: "Telecaller",
          designation: tc.designation || "Telecaller",
          oeType: undefined,
        };
      } else {
        const hr = await HR.findById(employeeId).lean();
        if (hr) {
          employee = {
            _id: hr.employeeRef || hr._id,
            name: hr.username,
            employeeCode: hr.employeeCode || `HR-${String(hr._id).slice(-4)}`,
            role: "HR",
            designation: hr.designation || "HR Manager",
            oeType: undefined,
          };
        }
      }
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const effectiveId = employee._id;
    const IndividualTask = GetModelByType("individual");
    const tasks = await IndividualTask.find({
      assignedTo: effectiveId,
      $or: [
        { "assignmentDetails.assignedAt": { $gte: start, $lte: end } },
        { completedAt: { $gte: start, $lte: end } },
        { updatedAt: { $gte: start, $lte: end } },
      ],
    })
      .populate("assignmentDetails.assignedBy", "name employeeCode")
      .populate("cat", "name")
      .sort({ "assignmentDetails.assignedAt": -1, updatedAt: -1 })
      .lean();

    let activities = tasks.map((t) => ({
      activityType: "Task",
      taskId: t._id,
      taskName: t.name,
      taskType: t.type || "composite",
      company: t.sub,
      product: t.cat?.name,
      assignedAt: t.assignmentDetails?.assignedAt,
      dueDate: t.assignmentDetails?.dueDate,
      status: t.status,
      completedAt: t.completedAt,
      assignedBy: t.assignmentDetails?.assignedBy?.name || "—",
      assignmentRemarks: t.assignmentDetails?.remarks || "—",
      completionRemarks: t.assignmentDetails?.completionRemarks || "—",
      priority: t.assignmentDetails?.priority || "—",
      forwardedFromRM: t.forwardedFromRM?.forwardedAt
        ? {
            at: t.forwardedFromRM.forwardedAt,
            remark: t.forwardedFromRM.remark,
          }
        : null,
      oeForwardedToRM: t.oeForwardedToRM?.forwardedAt
        ? {
            at: t.oeForwardedToRM.forwardedAt,
            remark: t.oeForwardedToRM.remark,
          }
        : null,
    }));

    if (employee.role === "Telecaller") {
      const telecallerDoc = await Telecaller.findOne({
        $or: [{ employeeRef: effectiveId }, { _id: employeeId }],
      })
        .populate("assignedSuspects.suspectId", "personalDetails.name personalDetails.mobileNo")
        .lean();
      if (telecallerDoc && Array.isArray(telecallerDoc.assignedSuspects)) {
        const suspectActivities = telecallerDoc.assignedSuspects
          .filter((s) => {
            const d = s.assignedAt ? new Date(s.assignedAt) : null;
            return d && d >= start && d <= end;
          })
          .map((s) => ({
            activityType: "Suspect Assigned",
            taskId: s.suspectId?._id,
            taskName: s.suspectId?.personalDetails?.name || "Suspect",
            taskType: "—",
            company: "—",
            product: "—",
            assignedAt: s.assignedAt,
            dueDate: null,
            status: s.status || "assigned",
            completedAt: null,
            assignedBy: "—",
            assignmentRemarks: "—",
            completionRemarks: "—",
            priority: "—",
            forwardedFromRM: null,
            oeForwardedToRM: null,
          }));
        activities = [...activities, ...suspectActivities];
      }
    }

    if (employee.role === "HR") {
      const hrDoc = await HR.findOne({
        $or: [{ employeeRef: effectiveId }, { _id: employeeId }],
      })
        .populate("managedEmployees.employeeId", "name employeeCode")
        .lean();
      if (hrDoc) {
        const hrRespActivities = (hrDoc.hrResponsibilities || [])
          .filter((r) => {
            const d = r.assignedDate ? new Date(r.assignedDate) : null;
            return d && d >= start && d <= end;
          })
          .map((r) => ({
            activityType: "HR Responsibility",
            taskId: null,
            taskName: r.responsibility || "—",
            taskType: "—",
            company: "—",
            product: "—",
            assignedAt: r.assignedDate,
            dueDate: null,
            status: "—",
            completedAt: null,
            assignedBy: "—",
            assignmentRemarks: "—",
            completionRemarks: "—",
            priority: "—",
            forwardedFromRM: null,
            oeForwardedToRM: null,
          }));
        const managedActivities = (hrDoc.managedEmployees || [])
          .filter((m) => {
            const d = m.assignedDate ? new Date(m.assignedDate) : null;
            return d && d >= start && d <= end;
          })
          .map((m) => ({
            activityType: "Employee Managed",
            taskId: m.employeeId?._id,
            taskName: m.employeeId?.name || "Employee",
            taskType: "—",
            company: m.employeeId?.employeeCode || "—",
            product: "—",
            assignedAt: m.assignedDate,
            dueDate: null,
            status: "—",
            completedAt: null,
            assignedBy: "—",
            assignmentRemarks: "—",
            completionRemarks: "—",
            priority: "—",
            forwardedFromRM: null,
            oeForwardedToRM: null,
          }));
        activities = [...activities, ...hrRespActivities, ...managedActivities];
      }
    }

    activities.sort((a, b) => {
      const da = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
      const db = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
      return db - da;
    });

    res.status(200).json({
      success: true,
      message: "Employee activity report fetched",
      data: {
        employee: {
          _id: employee._id,
          name: employee.name,
          employeeCode: employee.employeeCode,
          role: employee.role,
          designation: employee.designation,
          oeType: employee.oeType,
        },
        activities,
      },
    });
  } catch (error) {
    console.error("❌ getEmployeeActivityReport:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee activity report",
      error: error.message,
    });
  }
};
