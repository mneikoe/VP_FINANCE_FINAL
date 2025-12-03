// routes/futurePlansRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FuturePlanDocument = require("../Models/FuturePlanDocument");

// ✅ Ensure upload directory exists
const futurePlansDir = path.join(__dirname, "../public/Documents/FuturePlans");
if (!fs.existsSync(futurePlansDir)) {
  fs.mkdirSync(futurePlansDir, { recursive: true });
  console.log(`✅ Created directory: ${futurePlansDir}`);
}

// ✅ Create multer storage and upload middleware INSIDE the routes file
const futurePlansStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, futurePlansDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = path.parse(file.originalname).name;
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, safeName + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ PDF file filter
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// ✅ Create multer upload instance
const uploadFuturePlans = multer({
  storage: futurePlansStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single("document");

// ✅ Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

// 📄 UPLOAD NEW FUTURE PLAN DOCUMENT
router.post("/upload", (req, res) => {
  uploadFuturePlans(req, res, async function (err) {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      console.log("📥 Received request body:", req.body);
      console.log("📁 Received document file:", req.file);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a PDF file",
        });
      }

      const {
        title,
        description,
        category,
        strategicArea,
        priority,
        confidentialLevel,
        targetYear,
        tags,
        approvalStatus,
        uploadedBy,
      } = req.body;

      // ✅ SIMPLE VALIDATION
      if (!title || !uploadedBy || !category) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Title, Uploader Name and Category are required",
        });
      }

      const documentData = {
        title,
        description: description || "",
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileUrl: `/documents/future-plans/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        category,
        strategicArea: strategicArea || "Medium Term (3-5 years)",
        priority: priority || "Medium",
        confidentialLevel: confidentialLevel || "Internal",
        targetYear: targetYear ? parseInt(targetYear) : null,
        uploadedBy,
        approvalStatus: approvalStatus || "Pending",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      };

      console.log("💾 Future Plan data to save:", documentData);

      const document = new FuturePlanDocument(documentData);
      await document.save();

      res.status(201).json({
        success: true,
        message: "Future Plan uploaded successfully",
        data: {
          id: document._id,
          title: document.title,
          fileName: document.fileName,
          originalName: document.originalName,
          fileSize: formatFileSize(document.fileSize),
          category: document.category,
          strategicArea: document.strategicArea,
          priority: document.priority,
          approvalStatus: document.approvalStatus,
          fileUrl: document.fileUrl,
          downloadUrl: `/api/future-plans/download/${document._id}`,
        },
      });
    } catch (error) {
      console.error("❌ Error uploading future plan:", error);

      // Clean up uploaded file if error occurs
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to delete uploaded file:", unlinkError);
        }
      }

      // ✅ More detailed error information
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.message,
          details: error.errors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error uploading future plan",
        error: error.message,
      });
    }
  });
});

// 📄 GET ALL FUTURE PLANS
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      strategicArea,
      priority,
      approvalStatus,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Add filters
    if (category) query.category = category;
    if (strategicArea) query.strategicArea = strategicArea;
    if (priority) query.priority = priority;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const documents = await FuturePlanDocument.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await FuturePlanDocument.countDocuments(query);

    // Format documents
    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.fileSize),
      downloadUrl: `/api/future-plans/download/${doc._id}`,
    }));

    res.json({
      success: true,
      data: formattedDocuments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching future plans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching future plans",
      error: error.message,
    });
  }
});

// 📄 GET FUTURE PLAN BY ID
router.get("/:id", async (req, res) => {
  try {
    const document = await FuturePlanDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Future Plan not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...document.toObject(),
        formattedSize: formatFileSize(document.fileSize),
        downloadUrl: `/api/future-plans/download/${document._id}`,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching future plan:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching future plan",
      error: error.message,
    });
  }
});

// 📄 DOWNLOAD FUTURE PLAN DOCUMENT
router.get("/download/:id", async (req, res) => {
  try {
    const document = await FuturePlanDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Future Plan not found",
      });
    }

    if (!document.isActive) {
      return res.status(400).json({
        success: false,
        message: "Future Plan is not active",
      });
    }

    // Check if file exists
    const filePath = document.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Update download stats
    document.downloadCount += 1;
    document.lastDownloaded = new Date();
    await document.save();

    // Send file
    res.download(filePath, document.originalName, (err) => {
      if (err) {
        console.error("❌ Error downloading future plan:", err);
        res.status(500).json({
          success: false,
          message: "Error downloading file",
        });
      }
    });
  } catch (error) {
    console.error("❌ Error downloading future plan:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// 📄 VIEW FUTURE PLAN (inline in browser)
router.get("/view/:id", async (req, res) => {
  try {
    const document = await FuturePlanDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Future Plan not found",
      });
    }

    if (!document.isActive) {
      return res.status(400).json({
        success: false,
        message: "Future Plan is not active",
      });
    }

    // Check if file exists
    const filePath = document.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Update download stats
    document.downloadCount += 1;
    document.lastDownloaded = new Date();
    await document.save();

    // Set headers for PDF viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.originalName}"`
    );

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("❌ Error viewing future plan:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// 📄 UPDATE FUTURE PLAN (without file upload)
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      strategicArea,
      priority,
      confidentialLevel,
      targetYear,
      tags,
      approvalStatus,
      isActive,
      reviewDate,
      approvedBy,
    } = req.body;

    const document = await FuturePlanDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Future Plan not found",
      });
    }

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    if (strategicArea) document.strategicArea = strategicArea;
    if (priority) document.priority = priority;
    if (confidentialLevel) document.confidentialLevel = confidentialLevel;
    if (targetYear) document.targetYear = parseInt(targetYear);
    if (tags !== undefined) {
      document.tags = tags.split(",").map((tag) => tag.trim());
    }
    if (approvalStatus) {
      document.approvalStatus = approvalStatus;
      if (approvalStatus === "Approved") {
        document.reviewDate = new Date();
        document.approvedBy = approvedBy || "System Admin";
      }
    }
    if (isActive !== undefined) document.isActive = isActive;
    if (reviewDate) document.reviewDate = reviewDate;

    await document.save();

    res.json({
      success: true,
      message: "Future Plan updated successfully",
      data: document,
    });
  } catch (error) {
    console.error("❌ Error updating future plan:", error);
    res.status(500).json({
      success: false,
      message: "Error updating future plan",
      error: error.message,
    });
  }
});

// 📄 UPDATE FUTURE PLAN WITH NEW PDF FILE
router.put("/:id/upload", (req, res) => {
  uploadFuturePlans(req, res, async function (err) {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      const {
        title,
        description,
        category,
        strategicArea,
        priority,
        confidentialLevel,
        targetYear,
        tags,
        approvalStatus,
        isActive,
        reviewDate,
        approvedBy,
      } = req.body;

      const document = await FuturePlanDocument.findById(req.params.id);

      if (!document) {
        // Clean up uploaded file if document not found
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: "Future Plan not found",
        });
      }

      // Delete old file if new file is uploaded
      if (req.file) {
        if (document.filePath && fs.existsSync(document.filePath)) {
          fs.unlinkSync(document.filePath);
        }

        // Update file information
        document.fileName = req.file.filename;
        document.originalName = req.file.originalname;
        document.filePath = req.file.path;
        document.fileUrl = `/documents/future-plans/${req.file.filename}`;
        document.fileSize = req.file.size;
        document.fileType = req.file.mimetype;
      }

      // Update other fields
      if (title) document.title = title;
      if (description !== undefined) document.description = description;
      if (category) document.category = category;
      if (strategicArea) document.strategicArea = strategicArea;
      if (priority) document.priority = priority;
      if (confidentialLevel) document.confidentialLevel = confidentialLevel;
      if (targetYear) document.targetYear = parseInt(targetYear);
      if (tags !== undefined) {
        document.tags = tags.split(",").map((tag) => tag.trim());
      }
      if (approvalStatus) {
        document.approvalStatus = approvalStatus;
        if (approvalStatus === "Approved") {
          document.reviewDate = new Date();
          document.approvedBy = approvedBy || "System Admin";
        }
      }
      if (isActive !== undefined) document.isActive = isActive;
      if (reviewDate) document.reviewDate = reviewDate;

      await document.save();

      res.json({
        success: true,
        message: req.file
          ? "Future Plan and file updated successfully"
          : "Future Plan updated successfully",
        data: {
          ...document.toObject(),
          formattedSize: formatFileSize(document.fileSize),
          downloadUrl: `/api/future-plans/download/${document._id}`,
        },
      });
    } catch (error) {
      console.error("❌ Error updating future plan:", error);

      // Clean up uploaded file if error occurs
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to delete uploaded file:", unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: "Error updating future plan",
        error: error.message,
      });
    }
  });
});

// 📄 DELETE FUTURE PLAN
router.delete("/:id", async (req, res) => {
  try {
    const document = await FuturePlanDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Future Plan not found",
      });
    }

    // Delete file from server
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await FuturePlanDocument.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Future Plan deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting future plan:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting future plan",
      error: error.message,
    });
  }
});

// 📄 UPDATE APPROVAL STATUS
router.patch("/:id/approve", async (req, res) => {
  try {
    const { status, approvedBy } = req.body;

    const document = await FuturePlanDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Future Plan not found",
      });
    }

    document.approvalStatus = status;
    if (status === "Approved") {
      document.approvedBy = approvedBy || "System Admin";
      document.reviewDate = new Date();
    }

    await document.save();

    res.json({
      success: true,
      message: `Future Plan ${status.toLowerCase()} successfully`,
      data: document,
    });
  } catch (error) {
    console.error("❌ Error updating approval status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating approval status",
      error: error.message,
    });
  }
});

// 📄 GET STATISTICS
router.get("/stats/summary", async (req, res) => {
  try {
    const totalPlans = await FuturePlanDocument.countDocuments();
    const activePlans = await FuturePlanDocument.countDocuments({
      isActive: true,
    });
    const totalDownloads = await FuturePlanDocument.aggregate([
      { $group: { _id: null, total: { $sum: "$downloadCount" } } },
    ]);

    const categoryStats = await FuturePlanDocument.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const approvalStats = await FuturePlanDocument.aggregate([
      { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentUploads = await FuturePlanDocument.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category approvalStatus createdAt downloadCount");

    res.json({
      success: true,
      data: {
        totalPlans,
        activePlans,
        totalDownloads: totalDownloads[0]?.total || 0,
        byCategory: categoryStats,
        byApprovalStatus: approvalStats,
        recentUploads,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
});

// 📄 SEARCH FUTURE PLANS
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;

    const documents = await FuturePlanDocument.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { strategicArea: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.fileSize),
      downloadUrl: `/api/future-plans/download/${doc._id}`,
    }));

    res.json({
      success: true,
      query,
      count: documents.length,
      data: formattedDocuments,
    });
  } catch (error) {
    console.error("❌ Error searching future plans:", error);
    res.status(500).json({
      success: false,
      message: "Error searching future plans",
      error: error.message,
    });
  }
});

module.exports = router;
