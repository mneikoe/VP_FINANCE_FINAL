// routes/rulesRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const RulesDocument = require("../Models/RulesDocument");

// ✅ Ensure upload directory exists
const rulesDir = path.join(__dirname, "../public/Documents/Rules");
if (!fs.existsSync(rulesDir)) {
  fs.mkdirSync(rulesDir, { recursive: true });
  console.log(`✅ Created directory: ${rulesDir}`);
}

// ✅ Create multer storage and upload middleware INSIDE the routes file
const rulesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, rulesDir);
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
const uploadRules = multer({
  storage: rulesStorage,
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

// 📄 UPLOAD NEW RULES DOCUMENT
router.post("/upload", (req, res) => {
  uploadRules(req, res, async function (err) {
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

      const { title, description, category, version, tags, uploadedBy } =
        req.body;

      // ✅ SIMPLE VALIDATION
      if (!title || !uploadedBy) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Title and Uploader Name are required",
        });
      }

      const documentData = {
        title,
        description: description || "",
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileUrl: `/documents/rules/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        category: category || "General Rules",
        version: version || "1.0",
        uploadedBy,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      };

      console.log("💾 Document data to save:", documentData);

      const document = new RulesDocument(documentData);
      await document.save();

      res.status(201).json({
        success: true,
        message: "Rules document uploaded successfully",
        data: {
          id: document._id,
          title: document.title,
          fileName: document.fileName,
          originalName: document.originalName,
          fileSize: formatFileSize(document.fileSize),
          category: document.category,
          fileUrl: document.fileUrl,
          downloadUrl: `/api/rules/download/${document._id}`,
        },
      });
    } catch (error) {
      console.error("❌ Error uploading rules document:", error);

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
        message: "Error uploading rules document",
        error: error.message,
      });
    }
  });
});

// 📄 GET ALL RULES DOCUMENTS
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

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
    const documents = await RulesDocument.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await RulesDocument.countDocuments(query);

    // Format documents
    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.fileSize),
      downloadUrl: `/api/rules/download/${doc._id}`,
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
    console.error("❌ Error fetching rules documents:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rules documents",
      error: error.message,
    });
  }
});

// 📄 GET RULES DOCUMENT BY ID
router.get("/:id", async (req, res) => {
  try {
    const document = await RulesDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...document.toObject(),
        formattedSize: formatFileSize(document.fileSize),
        downloadUrl: `/api/rules/download/${document._id}`,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching rules document:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rules document",
      error: error.message,
    });
  }
});

// 📄 DOWNLOAD RULES DOCUMENT
router.get("/download/:id", async (req, res) => {
  try {
    const document = await RulesDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.isActive) {
      return res.status(400).json({
        success: false,
        message: "Document is not active",
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
        console.error("❌ Error downloading document:", err);
        res.status(500).json({
          success: false,
          message: "Error downloading file",
        });
      }
    });
  } catch (error) {
    console.error("❌ Error downloading rules document:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// 📄 VIEW RULES DOCUMENT (inline in browser)
router.get("/view/:id", async (req, res) => {
  try {
    const document = await RulesDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.isActive) {
      return res.status(400).json({
        success: false,
        message: "Document is not active",
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
    console.error("❌ Error viewing rules document:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// 📄 UPDATE RULES DOCUMENT (without file upload)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, category, version, tags, isActive } = req.body;

    const document = await RulesDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    if (version) document.version = version;
    if (tags !== undefined) {
      document.tags = tags.split(",").map((tag) => tag.trim());
    }
    if (isActive !== undefined) document.isActive = isActive;

    await document.save();

    res.json({
      success: true,
      message: "Document updated successfully",
      data: document,
    });
  } catch (error) {
    console.error("❌ Error updating rules document:", error);
    res.status(500).json({
      success: false,
      message: "Error updating rules document",
      error: error.message,
    });
  }
});

// 📄 UPDATE RULES DOCUMENT WITH NEW PDF FILE
router.put("/:id/upload", (req, res) => {
  uploadRules(req, res, async function (err) {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      const { title, description, category, version, tags, isActive } =
        req.body;

      const document = await RulesDocument.findById(req.params.id);

      if (!document) {
        // Clean up uploaded file if document not found
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: "Document not found",
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
        document.fileUrl = `/documents/rules/${req.file.filename}`;
        document.fileSize = req.file.size;
        document.fileType = req.file.mimetype;
      }

      // Update other fields
      if (title) document.title = title;
      if (description !== undefined) document.description = description;
      if (category) document.category = category;
      if (version) document.version = version;
      if (tags !== undefined) {
        document.tags = tags.split(",").map((tag) => tag.trim());
      }
      if (isActive !== undefined) document.isActive = isActive;

      await document.save();

      res.json({
        success: true,
        message: req.file
          ? "Document and file updated successfully"
          : "Document updated successfully",
        data: {
          ...document.toObject(),
          formattedSize: formatFileSize(document.fileSize),
          downloadUrl: `/api/rules/download/${document._id}`,
        },
      });
    } catch (error) {
      console.error("❌ Error updating rules document:", error);

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
        message: "Error updating rules document",
        error: error.message,
      });
    }
  });
});

// 📄 DELETE RULES DOCUMENT
router.delete("/:id", async (req, res) => {
  try {
    const document = await RulesDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete file from server
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await RulesDocument.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting rules document:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting rules document",
      error: error.message,
    });
  }
});

// 📄 GET STATISTICS
router.get("/stats/summary", async (req, res) => {
  try {
    const totalDocuments = await RulesDocument.countDocuments();
    const activeDocuments = await RulesDocument.countDocuments({
      isActive: true,
    });
    const totalDownloads = await RulesDocument.aggregate([
      { $group: { _id: null, total: { $sum: "$downloadCount" } } },
    ]);

    const categoryStats = await RulesDocument.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentUploads = await RulesDocument.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category createdAt downloadCount");

    res.json({
      success: true,
      data: {
        totalDocuments,
        activeDocuments,
        totalDownloads: totalDownloads[0]?.total || 0,
        byCategory: categoryStats,
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

// 📄 SEARCH DOCUMENTS
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;

    const documents = await RulesDocument.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.fileSize),
      downloadUrl: `/api/rules/download/${doc._id}`,
    }));

    res.json({
      success: true,
      query,
      count: documents.length,
      data: formattedDocuments,
    });
  } catch (error) {
    console.error("❌ Error searching documents:", error);
    res.status(500).json({
      success: false,
      message: "Error searching documents",
      error: error.message,
    });
  }
});

module.exports = router;
