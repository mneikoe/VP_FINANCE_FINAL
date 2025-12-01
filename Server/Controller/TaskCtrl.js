// const getModelByType = require("../utils/GetModelByType"); // adjust the path if needed
// const Financial = require("../Models/FinancialProductModel");

// const path = require("path");

// // // Create a new task
// exports.createTask = async (req, res) => {
//   console.log(req.body);
//   try {
//     const type = req.body.type;
//     console.log(type, "type of the model");
//     const TaskModel = getModelByType(type);
//     // Clean field names (remove tab characters)
//     const body = {};
//     console.log("body data", body);

//     for (let key in req.body) {
//       body[key.trim()] = req.body[key];
//     }

//     // Handle files
//     const image = req.files?.image?.[0]?.filename || "";
//     // const downloadFormUrl = req.files?.downloadFormUrl?.[0]?.filename || "";
//     // const sampleFormUrl = req.files?.sampleFormUrl?.[0]?.filename || "";
//     let downloadFormFiles = req.files?.downloadFormUrl || [];
//     let sampleFormFiles = req.files?.sampleFormUrl || [];

//     // Prepare checklists array
//     const checklists = Array.isArray(body.checklists)
//       ? body.checklists
//       : body.checklists
//       ? [body.checklists]
//       : [];

//     // // Parse formChecklists (if JSON string)
//     // let formChecklists = [];
//     // if (body.formChecklists) {
//     //   formChecklists = JSON.parse(body.formChecklists);
//     //   if (formChecklists.length > 0) {
//     //     formChecklists[0].downloadFormUrl = downloadFormUrl;
//     //     formChecklists[0].sampleFormUrl = sampleFormUrl;
//     //   }
//     // }

//     // Parse formChecklists
//     let formChecklists = [];
//     if (body.formChecklists) {
//       formChecklists = JSON.parse(body.formChecklists);

//       // Attach the files to each checklist object
//       formChecklists = formChecklists.map((item, index) => {
//         return {
//           name: item.name,
//           downloadFormUrl: downloadFormFiles[index]?.filename || "",
//           sampleFormUrl: sampleFormFiles[index]?.filename || "",
//         };
//       });
//     }

//     const cats = await Financial.findOne({ _id: req.body.cat });

//     // Create a new task document
//     const newTask = new TaskModel({
//       type,
//       cat: cats.name,
//       sub: body.sub,
//       depart: body.depart,
//       name: body.name,
//       descp: {
//         text: body.descpText,
//         image: image,
//       },
//       email_descp: body.email_descp,
//       sms_descp: body.sms_descp,
//       whatsapp_descp: body.whatsapp_descp,
//       checklists: checklists,
//       formChecklists: formChecklists,
//     });

//     // Save to database
//     await newTask.save();

//     res.status(201).json({
//       message: "Task created successfully",
//       task: newTask,
//     });
//   } catch (err) {
//     console.error("Error saving task:", err);
//     res.status(500).json({
//       message: "Failed to create task",
//       error: err.message,
//     });
//   }
// };

// // Get all tasks
// exports.getAllTasks = async (req, res) => {
//   try {
//     const type = req.query.type;
//     console.log(type, "type of the model");
//     // const { type } = req.query;
//     const TaskModel = getModelByType(type);
//     const tasks = await TaskModel.find().sort({ createdAt: -1 });
//     res.status(200).json(tasks);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Failed to fetch tasks", error: err.message });
//   }
// };

// exports.getTaskById = async (req, res) => {
//   try {
//     // ✅ Get task type from query parameter
//     const type = req.query.type;
//     console.log(type, "type of the model");
//     // const { type } = req.query;

//     // ✅ Get correct model based on type
//     const TaskModel = getModelByType(type);
//     const task = await TaskModel.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });
//     res.status(200).json(task);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Failed to fetch task", error: err.message });
//   }
// };

// exports.updateTask = async (req, res) => {
//   try {
//     const type = req.body.type;
//     console.log(type, "type of the model");
//     const TaskModel = getModelByType(type);
//     const id = req.params.id;
//     const body = {};
//     for (let key in req.body) {
//       body[key.trim()] = req.body[key];
//     }

//     const updates = {
//       cat: body.cat,
//       sub: body.sub,
//       depart: body.depart,
//       name: body.name,
//       email_descp: body.email_descp,
//       sms_descp: body.sms_descp,
//       whatsapp_descp: body.whatsapp_descp,
//       checklists: Array.isArray(body.checklists)
//         ? body.checklists
//         : body.checklists
//         ? [body.checklists]
//         : [],
//       descp: {
//         text: body.descpText || "",
//       },
//     };

//     // ✅ Handle optional image update
//     if (req.files?.image?.[0]) {
//       updates.descp.image = req.files.image[0].filename;
//     }

//     // ✅ Handle formChecklists update if provided
//     if (body.formChecklists) {
//       let parsed = [];
//       try {
//         parsed = JSON.parse(body.formChecklists);
//         if (parsed.length > 0) {
//           if (req.files?.downloadFormUrl?.[0]) {
//             parsed[0].downloadFormUrl = req.files.downloadFormUrl[0].filename;
//           }
//           if (req.files?.sampleFormUrl?.[0]) {
//             parsed[0].sampleFormUrl = req.files.sampleFormUrl[0].filename;
//           }
//         }
//         updates.formChecklists = parsed;
//       } catch (err) {
//         return res
//           .status(400)
//           .json({ message: "Invalid formChecklists format" });
//       }
//     }

//     console.log(updates, "wertyuio");

//     const updated = await TaskModel.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     res.status(200).json({ message: "Task updated", task: updated });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// };

// exports.deleteTask = async (req, res) => {
//   try {
//     const type = req.query.type;
//     console.log(type, "type of the model");
//     // const { type } = req.query;
//     const TaskModel = getModelByType(type);

//     // ✅ [3] Replaced hardcoded CompositeTask with dynamic model
//     const deleted = await TaskModel.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Task not found" });
//     res.status(200).json({ message: "Task deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Delete failed", error: err.message });
//   }
// };







// const { getModelByType } = require("../utils/GetModelByType.js");
import GetModelByType from "../utils/GetModelByType.js";
// const Financial = require("../Models/FinancialProductModel");
import FinancialProductModel from "../Models/FinancialProductModel.js";
// const mongoose = require("mongoose");
import mongoose from "mongoose";
// const path = require("path");
import path from "path";
import fs from "fs"
// const fs = require("fs").promises;

// Helper function to clean request body
const cleanRequestBody = (body) => {
  const cleaned = {};
  for (let key in body) {
    cleaned[key.trim()] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }
  return cleaned;
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const type = req.body.type;
    console.log(`Creating task of type: ${type}`);
    
    const TaskModel = GetModelByType(type);
    const body = cleanRequestBody(req.body);

    // Validate required fields
    if (!body.cat || !body.sub || !body.depart || !body.name) {
      return res.status(400).json({
        message: "Missing required fields: cat, sub, depart, name",
      });
    }

    // Validate financial product exists
    if (!isValidObjectId(body.cat)) {
      return res.status(400).json({
        message: "Invalid financial product ID format",
      });
    }

    // const financialProduct = await Financial.findById(body.cat);
    const financialProduct = await FinancialProductModel.findById(body.cat);
    
    
    if (!financialProduct) {
      return res.status(404).json({
        message: "Financial product not found",
      });
    }

    // Handle files
    const image = req.files?.image?.[0]?.filename || "";
    let downloadFormFiles = req.files?.downloadFormUrl || [];
    let sampleFormFiles = req.files?.sampleFormUrl || [];

    // Prepare checklists array
    const checklists = Array.isArray(body.checklists)
      ? body.checklists.filter(item => item.trim() !== '')
      : body.checklists
      ? [body.checklists].filter(item => item.trim() !== '')
      : [];

    // Parse formChecklists
    let formChecklists = [];
    if (body.formChecklists) {
      try {
        const parsed = JSON.parse(body.formChecklists);
        formChecklists = parsed.map((item, index) => ({
          name: item.name?.trim() || '',
          downloadFormUrl: downloadFormFiles[index]?.filename || "",
          sampleFormUrl: sampleFormFiles[index]?.filename || "",
        })).filter(item => item.name !== '');
      } catch (error) {
        return res.status(400).json({
          message: "Invalid formChecklists JSON format",
        });
      }
    }

    // Create a new task document
    const newTask = new TaskModel({
      type,
      cat: body.cat, // ObjectId reference
      sub: body.sub,
      depart: body.depart,
      name: body.name,
      descp: {
        text: body.descpText || "",
        image: image,
      },
      email_descp: body.email_descp || "",
      sms_descp: body.sms_descp || "",
      whatsapp_descp: body.whatsapp_descp || "",
      checklists: checklists,
      formChecklists: formChecklists,
      status: body.status || 'active',
      createdBy: req.user?.id, // Assuming you have user info in req.user
    });

    // Save to database
    await newTask.save();
    
    // Populate the financial product name
    await newTask.populate('cat', 'name');

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({
      message: "Failed to create task",
      error: err.message,
    });
  }
};

// Get all tasks with filtering and pagination
export const getAllTasks = async (req, res) => {
  try {
    // console.log(req);
    
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    console.log(type);
    
    
    const TaskModel = GetModelByType(type);
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sub: { $regex: search, $options: 'i' } },
        { depart: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      TaskModel.find(query)
        .populate('cat', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TaskModel.countDocuments(query)
    ]);

    console.log(tasks);
    console.log(total);
    

    res.status(200).json({
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ 
      message: "Failed to fetch tasks", 
      error: err.message 
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const type = req.query.type;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const TaskModel = GetModelByType(type);
    const task = await TaskModel.findById(id).populate('cat', 'name category description');
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(200).json({ task });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ 
      message: "Failed to fetch task", 
      error: err.message 
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const type = req.body.type;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const TaskModel = GetModelByType(type);
    const body = cleanRequestBody(req.body);

    // Check if task exists
    const existingTask = await TaskModel.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate financial product if cat is being updated
    if (body.cat && body.cat !== existingTask.cat.toString()) {
      if (!isValidObjectId(body.cat)) {
        return res.status(400).json({ message: "Invalid financial product ID format" });
      }
      
      const financialProduct = await FinancialProductModel.findById(body.cat);
      if (!financialProduct) {
        return res.status(404).json({ message: "Financial product not found" });
      }
    }

    const updates = {
      ...(body.cat && { cat: body.cat }),
      ...(body.sub && { sub: body.sub }),
      ...(body.depart && { depart: body.depart }),
      ...(body.name && { name: body.name }),
      ...(body.email_descp !== undefined && { email_descp: body.email_descp }),
      ...(body.sms_descp !== undefined && { sms_descp: body.sms_descp }),
      ...(body.whatsapp_descp !== undefined && { whatsapp_descp: body.whatsapp_descp }),
      ...(body.status && { status: body.status }),
      descp: {
        text: body.descpText || existingTask.descp.text,
        image: existingTask.descp.image
      },
    };

    // Handle image update
    if (req.files?.image?.[0]) {
      updates.descp.image = req.files.image[0].filename;
      
      // Delete old image if it exists
      if (existingTask.descp.image) {
        try {
          await fs.unlink(path.join(__dirname, '../uploads', existingTask.descp.image));
        } catch (err) {
          console.log("Old image file not found or already deleted");
        }
      }
    }

    // Handle checklists
    if (body.checklists !== undefined) {
      updates.checklists = Array.isArray(body.checklists)
        ? body.checklists.filter(item => item.trim() !== '')
        : body.checklists
        ? [body.checklists].filter(item => item.trim() !== '')
        : [];
    }

    // Handle formChecklists update
    if (body.formChecklists) {
      try {
        let parsed = JSON.parse(body.formChecklists);
        let downloadFormFiles = req.files?.downloadFormUrl || [];
        let sampleFormFiles = req.files?.sampleFormUrl || [];

        updates.formChecklists = parsed.map((item, index) => {
          const existing = existingTask.formChecklists[index] || {};
          return {
            name: item.name?.trim() || '',
            downloadFormUrl: downloadFormFiles[index]?.filename || existing.downloadFormUrl || "",
            sampleFormUrl: sampleFormFiles[index]?.filename || existing.sampleFormUrl || "",
          };
        }).filter(item => item.name !== '');
      } catch (err) {
        return res.status(400).json({ message: "Invalid formChecklists format" });
      }
    }

    const updated = await TaskModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('cat', 'name category');

    console.log(updated,"this is update function");

    res.status(200).json({ 
      message: "Task updated successfully", 
      task: updated 
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ 
      message: "Update failed", 
      error: err.message 
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const type = req.query.type;
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const validStatuses = ['active', 'inactive', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const TaskModel = GetModelByType(type);
    const updated = await TaskModel.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    ).populate('cat', 'name category');

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ 
      message: "Task status updated successfully", 
      task: updated 
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ 
      message: "Status update failed", 
      error: err.message 
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const type = req.query.type;
    const { id } = req.params;

    console.log(id,type,"this is for delete");
    

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const TaskModel = GetModelByType(type);
    const task = await TaskModel.findById(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete associated files
    const filesToDelete = [];
    if (task.descp.image) filesToDelete.push(task.descp.image);
    
    task.formChecklists.forEach(checklist => {
      if (checklist.downloadFormUrl) filesToDelete.push(checklist.downloadFormUrl);
      if (checklist.sampleFormUrl) filesToDelete.push(checklist.sampleFormUrl);
    });

    // Delete files asynchronously
    filesToDelete.forEach(async (filename) => {
      try {
        await fs.unlink(path.join(__dirname, '../uploads', filename));
      } catch (err) {
        console.log(`File ${filename} not found or already deleted`);
      }
    });

    await TaskModel.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ 
      message: "Delete failed", 
      error: err.message 
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const type = req.query.type;
    const TaskModel = GetModelByType(type);

    const stats = await TaskModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await TaskModel.countDocuments();
    
    const formattedStats = {
      total,
      active: 0,
      inactive: 0,
      draft: 0
    };

    stats.forEach(stat => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
      }
    });

    res.status(200).json({ stats: formattedStats });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ 
      message: "Failed to get statistics", 
      error: err.message 
    });
  }
};

// Bulk delete tasks
export const bulkDeleteTasks = async (req, res) => {
  try {
    const type = req.body.type;
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "Task IDs array is required" });
    }

    // Validate all IDs
    const invalidIds = taskIds.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: "Invalid task ID format", 
        invalidIds 
      });
    }

    const TaskModel = GetModelByType(type);
    const result = await TaskModel.deleteMany({ _id: { $in: taskIds } });

    res.status(200).json({ 
      message: `${result.deletedCount} tasks deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ 
      message: "Bulk delete failed", 
      error: err.message 
    });
  }
};

// Bulk update status
export const bulkUpdateStatus = async (req, res) => {
  try {
    const type = req.body.type;
    const { taskIds, status } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "Task IDs array is required" });
    }

    const validStatuses = ['active', 'inactive', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const TaskModel = GetModelByType(type);
    const result = await TaskModel.updateMany(
      { _id: { $in: taskIds } },
      { status }
    );

    res.status(200).json({ 
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ 
      message: "Bulk update failed", 
      error: err.message 
    });
  }
};