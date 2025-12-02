const express = require("express");
const router = express.Router();
const Vacancy = require("../Models/Vacancy");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/vacancy-documents/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fileName = "vacancy-" + uniqueSuffix + ext;
    cb(null, fileName);
  },
});

// ✅ File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// ✅ GET all vacancies
router.get("/", async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdDate: -1 });
    res.json({
      success: true,
      vacancies: vacancies,
    });
  } catch (error) {
    console.error("❌ Error fetching vacancies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vacancies",
      error: error.message,
    });
  }
});

// ✅ CREATE new vacancy
router.post("/", upload.single("document"), async (req, res) => {
  try {
    console.log("📥 Received request body:", req.body);
    console.log("📁 Received file:", req.file);

    const { vacancy, designation, date, platform, description } = req.body;

    // ✅ Validation
    if (!vacancy && !designation) {
      return res.status(400).json({
        success: false,
        message: "Vacancy/Designation field is required",
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Platform field is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document",
      });
    }

    // ✅ Process platform data
    let platformsArray = [];
    if (typeof platform === "string") {
      platformsArray = platform
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
    } else if (Array.isArray(platform)) {
      platformsArray = platform;
    }

    if (platformsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one platform is required",
      });
    }

    // ✅ Create vacancy data
    const vacancyData = {
      designation: vacancy || designation,
      description: description || "",
      publishPlatform: platformsArray,
      createdDate: date ? new Date(date) : new Date(),
      status: "Active",
      document: req.file.filename,
      originalFileName: req.file.originalname,
    };

    console.log("💾 Creating vacancy with:", vacancyData);

    const newVacancy = new Vacancy(vacancyData);
    await newVacancy.save();

    res.status(201).json({
      success: true,
      message: "Vacancy created successfully",
      vacancy: newVacancy,
    });
  } catch (error) {
    console.error("❌ Error creating vacancy:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size should be less than 10MB",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating vacancy",
      error: error.message,
    });
  }
});

// ✅ UPDATE vacancy status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, closingDate } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updateData = { status };

    if (status === "Closed" && closingDate) {
      updateData.closingDate = new Date(closingDate);
    }

    const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    res.json({
      success: true,
      message: `Vacancy status updated to ${status}`,
      vacancy,
    });
  } catch (error) {
    console.error("❌ Error updating vacancy status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating vacancy status",
      error: error.message,
    });
  }
});

// ✅ GET single vacancy
router.get("/:id", async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    res.json({
      success: true,
      vacancy,
    });
  } catch (error) {
    console.error("❌ Error fetching vacancy:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vacancy",
      error: error.message,
    });
  }
});

// ✅ DOWNLOAD document
router.get("/documents/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    if (ext === ".pdf") {
      contentType = "application/pdf";
    } else if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".doc") {
      contentType = "application/msword";
    } else if (ext === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // Set headers for download or view
    const isView = req.query.view === "true";

    if (isView) {
      // For viewing in browser
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + filename + '"'
      );
    } else {
      // For downloading
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + filename + '"'
      );
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("❌ Error serving document:", error);
    res.status(500).json({
      success: false,
      message: "Error serving document",
      error: error.message,
    });
  }
});

// ✅ PREVIEW document (returns document info without downloading)
router.get("/:id/document-info", async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    const filePath = path.join(uploadDir, vacancy.document);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Document file not found",
      });
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(vacancy.document).toLowerCase();

    res.json({
      success: true,
      documentInfo: {
        filename: vacancy.document,
        originalName: vacancy.originalFileName || vacancy.document,
        size: stats.size,
        uploadDate: vacancy.createdAt,
        fileType: ext.replace(".", "").toUpperCase(),
        downloadUrl: `/api/vacancynotice/documents/${vacancy.document}`,
        viewUrl: `/api/vacancynotice/documents/${vacancy.document}?view=true`,
      },
    });
  } catch (error) {
    console.error("❌ Error getting document info:", error);
    res.status(500).json({
      success: false,
      message: "Error getting document info",
      error: error.message,
    });
  }
});

// ✅ DELETE vacancy
router.delete("/:id", async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    // Delete document file
    if (vacancy.document) {
      const filePath = path.join(uploadDir, vacancy.document);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await vacancy.deleteOne();

    res.json({
      success: true,
      message: "Vacancy deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting vacancy:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting vacancy",
      error: error.message,
    });
  }
});

// ✅ UPDATE vacancy (full update)
router.put("/:id", upload.single("document"), async (req, res) => {
  try {
    const {
      vacancy: designation,
      date,
      platform,
      description,
      status,
    } = req.body;

    const updateData = {
      designation,
      description: description || "",
      publishPlatform:
        typeof platform === "string"
          ? platform.split(",").map((p) => p.trim())
          : platform,
      status: status || "Active",
    };

    if (date) {
      updateData.createdDate = new Date(date);
    }

    // Handle new document upload
    if (req.file) {
      // Delete old document if exists
      const oldVacancy = await Vacancy.findById(req.params.id);
      if (oldVacancy && oldVacancy.document) {
        const oldFilePath = path.join(uploadDir, oldVacancy.document);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      updateData.document = req.file.filename;
      updateData.originalFileName = req.file.originalname;
    }

    const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    res.json({
      success: true,
      message: "Vacancy updated successfully",
      vacancy,
    });
  } catch (error) {
    console.error("❌ Error updating vacancy:", error);
    res.status(500).json({
      success: false,
      message: "Error updating vacancy",
      error: error.message,
    });
  }
});

module.exports = router;
