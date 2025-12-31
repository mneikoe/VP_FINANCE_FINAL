import GetModelByType from "../utils/GetModelByType.js";
import FinancialProductModel from "../Models/FinancialProductModel.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Employee from "../Models/employeeModel.js";
import SusProsClient from "../Models/SusProsClientSchema.js";
// createTask function में type checking update करें:
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

    // Parse formChecklists
    let formChecklists = [];
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        formChecklists = parsed
          .map((item) => ({
            name: item.name?.trim() || "",
            downloadFormUrl: item.downloadFormUrl || "",
            sampleFormUrl: item.sampleFormUrl || "",
          }))
          .filter((item) => item.name !== "");
      } catch (error) {
        console.error("Error parsing formChecklists:", error);
      }
    }

    // Create task data
    const taskData = {
      cat: req.body.cat,
      sub: req.body.sub || "",
      depart: departArray,
      name: req.body.name,
      estimatedDays: parseInt(req.body.estimatedDays) || 1,
      templatePriority: req.body.templatePriority || "medium",
      descp: {
        text: req.body.descpText || "",
        image: image,
      },
      email_descp: req.body.email_descp || "",
      sms_descp: req.body.sms_descp || "",
      whatsapp_descp: req.body.whatsapp_descp || "",
      checklists: checklists,
      formChecklists: formChecklists,
      status: req.body.status || "template",
      createdBy: req.user?.id,
    };

    // ✅ Marketing और Composite दोनों के लिए assignments field add करें
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
    }

    // Handle checklists
    if (req.body.checklists !== undefined) {
      updates.checklists = Array.isArray(req.body.checklists)
        ? req.body.checklists.filter((item) => item && item.trim() !== "")
        : [];
    }

    // Handle formChecklists
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        updates.formChecklists = parsed
          .map((item) => ({
            name: item.name?.trim() || "",
            downloadFormUrl: item.downloadFormUrl || "",
            sampleFormUrl: item.sampleFormUrl || "",
          }))
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

export const assignCompositeTask = async (req, res) => {
  try {
    const {
      taskId,
      assignments,
      assignedBy,
      // ✅ NEW: Add client/prospect selection
      clients = [],
      prospects = [],
      // ✅ Optional: Any specific remarks for client/prospect assignment
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

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        errors.push(`Employee ${employeeId} not found`);
        continue;
      }

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
        dueDate: dueDate
          ? new Date(dueDate)
          : new Date(
              Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000
            ),
        status: "pending",
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

    // ✅ Update composite task - assignments array में जोड़ें
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
        status: "assigned",
        parentTask: taskId,
        assignedTo: assignment.employeeId,
        assignmentDetails: {
          priority: assignment.priority,
          remarks: assignment.remarks,
          dueDate: assignment.dueDate,
          assignedBy: assignment.assignedBy,
          assignedAt: assignment.assignedAt,
          // ✅ YEH FIELDS ASSIGNMENTDETAILS KE ANDAR MOVE KARO
          assignedClients: assignment.assignedClients,
          assignedProspects: assignment.assignedProspects,
          clientAssignmentRemarks: assignment.clientAssignmentRemarks,
          prospectAssignmentRemarks: assignment.prospectAssignmentRemarks,
        },
        // ❌ YEH FIELDS DELETE KARO (kyunki schema mein nahi hain)
        // assignedClients: assignment.assignedClients,
        // assignedProspects: assignment.assignedProspects,
        // clientAssignmentRemarks: assignment.clientAssignmentRemarks,
        // prospectAssignmentRemarks: assignment.prospectAssignmentRemarks,
        createdBy: assignedBy,
      });

      await individualTask.save();
      individualTasks.push(individualTask._id);

      // TaskCtrl.js - assignCompositeTask function mein YEH SECTION REPLACE KARO:

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
                assignedToName: employee.name,
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
                assignedToName: employee.name,
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
      status: { $in: ["assigned", "in-progress", "pending"] },
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
        assignmentDetails: task.assignmentDetails || {},
        cat: task.cat || { name: "General" },
        // ✅ IMPORTANT: Yeh fields frontend ke liye
        assignedClients: clientDetails,
        assignedProspects: prospectDetails,
        clientCount: clientDetails.length,
        prospectCount: prospectDetails.length,
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
      dueDate: dueDate
        ? new Date(dueDate)
        : new Date(
            Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000
          ),
      status: "pending",
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
    }

    // Handle checklists
    if (req.body.checklists !== undefined) {
      updates.checklists = Array.isArray(req.body.checklists)
        ? req.body.checklists.filter((item) => item && item.trim() !== "")
        : [];
    }

    // Handle formChecklists
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        updates.formChecklists = parsed
          .map((item) => ({
            name: item.name?.trim() || "",
            downloadFormUrl: item.downloadFormUrl || "",
            sampleFormUrl: item.sampleFormUrl || "",
          }))
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
      dueDate: dueDate
        ? new Date(dueDate)
        : new Date(
            Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000
          ),
      status: "pending",
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
    }

    // Handle checklists
    if (req.body.checklists !== undefined) {
      updates.checklists = Array.isArray(req.body.checklists)
        ? req.body.checklists.filter((item) => item && item.trim() !== "")
        : [];
    }

    // Handle formChecklists
    if (req.body.formChecklists) {
      try {
        const parsed = JSON.parse(req.body.formChecklists);
        updates.formChecklists = parsed
          .map((item) => ({
            name: item.name?.trim() || "",
            downloadFormUrl: item.downloadFormUrl || "",
            sampleFormUrl: item.sampleFormUrl || "",
          }))
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
    const isClient = task.assignmentDetails?.assignedClients?.some(
      (id) => id.toString() === entityId
    );
    const isProspect = task.assignmentDetails?.assignedProspects?.some(
      (id) => id.toString() === entityId
    );

    if (!isClient && !isProspect) {
      return res.status(400).json({
        success: false,
        message: "This entity is not assigned to this task",
      });
    }

    const entityType = isClient ? "client" : "prospect";

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
    const SusProsClient = mongoose.model("testSchema");
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
    const { status, remarks, employeeId, employeeName } = req.body;

    console.log(`🔄 Updating task ${taskId} status to ${status}`);

    const IndividualTask = GetModelByType("individual");
    const task = await IndividualTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Update task status
    task.status = status;
    task.completedAt = new Date();
    if (remarks) {
      task.assignmentDetails.completionRemarks = remarks;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${status}`,
      task: {
        id: task._id,
        name: task.name,
        status: task.status,
        completedAt: task.completedAt,
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
