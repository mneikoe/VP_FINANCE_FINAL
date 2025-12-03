const express = require("express");
const router = express.Router();
const Internship = require("../Models/Internship");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    // Different folders for different file types
    if (file.fieldname === "certificateFile") {
      uploadPath = path.join(__dirname, "../uploads/internship/certificates");
    } else if (file.fieldname === "resume") {
      uploadPath = path.join(__dirname, "../uploads/internship/resumes");
    } else if (file.fieldname === "transcript") {
      uploadPath = path.join(__dirname, "../uploads/internship/transcripts");
    } else {
      uploadPath = path.join(__dirname, "../uploads/internship/others");
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${originalName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Max 10 files
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = {
      "application/pdf": true,
      "application/msword": true,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
      "image/jpeg": true,
      "image/jpg": true,
      "image/png": true,
    };

    if (allowedMimes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only PDF, DOC, DOCX, JPEG, JPG, PNG are allowed. You uploaded: ${file.mimetype}`
        )
      );
    }
  },
});

// @route   GET /api/internships
// @desc    Get all internship applications
router.get("/", async (req, res) => {
  try {
    const {
      status,
      department,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { isActive: true };

    // Filters
    if (status && status !== "all") query.status = status;
    if (department && department !== "all") query.department = department;

    // Search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { universityName: { $regex: search, $options: "i" } },
        { positionApplied: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const internships = await Internship.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort)
      .select("-__v");

    const total = await Internship.countDocuments(query);

    res.json({
      success: true,
      data: internships,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/internships/:id
// @desc    Get single internship application
router.get("/:id", async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "assignedSupervisor",
      "name email department"
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship application not found",
      });
    }

    res.json({
      success: true,
      data: internship,
    });
  } catch (error) {
    console.error("Error fetching internship:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @route   POST /api/internships
// @desc    Create new internship application
router.post(
  "/",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "transcript", maxCount: 1 },
    { name: "otherDocuments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      console.log("Request Files:", req.files);

      let formData;

      // Check if data is coming as JSON string in 'data' field
      if (req.body.data) {
        try {
          formData = JSON.parse(req.body.data);
          console.log("Parsed formData from 'data' field:", formData);
        } catch (parseError) {
          console.error("Error parsing JSON data:", parseError);
          return res.status(400).json({
            success: false,
            message: "Invalid JSON data format",
          });
        }
      } else {
        // If data is sent directly in body
        formData = req.body;
        console.log("FormData from request body:", formData);
      }

      // Debug: Log all received data
      console.log("Full request body keys:", Object.keys(req.body));
      console.log("FormData keys:", Object.keys(formData));

      // Validate required fields
      const requiredFields = [
        "fullName",
        "gender",
        "dateOfBirth",
        "nationality",
        "contactNo",
        "email",
        "permanentAddress",
        "universityName",
        "degreeProgram",
        "yearOfStudy",
        "expectedGraduationDate",
        "positionApplied",
        "preferredStartDate",
        "preferredEndDate",
        "hoursPerWeek",
        "declarationAccepted",
      ];

      // Check each required field
      const missingFields = [];
      const presentFields = [];

      requiredFields.forEach((field) => {
        if (!formData[field] && formData[field] !== false) {
          missingFields.push(field);
        } else {
          presentFields.push(field);
        }
      });

      console.log("Present fields:", presentFields);
      console.log("Missing fields:", missingFields);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          debug: {
            receivedData: formData,
            missingFields: missingFields,
            presentFields: presentFields,
          },
        });
      }

      // Validate declaration
      if (
        formData.declarationAccepted !== "true" &&
        formData.declarationAccepted !== true &&
        formData.declarationAccepted !== "false"
      ) {
        return res.status(400).json({
          success: false,
          message: "You must accept the declaration",
        });
      }

      // Check if resume is uploaded
      if (!req.files || !req.files.resume) {
        return res.status(400).json({
          success: false,
          message: "Resume is required",
        });
      }

      // Prepare data for saving
      const internshipData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        expectedGraduationDate: new Date(formData.expectedGraduationDate),
        preferredStartDate: new Date(formData.preferredStartDate),
        preferredEndDate: new Date(formData.preferredEndDate),
        declarationAccepted:
          formData.declarationAccepted === "true" ||
          formData.declarationAccepted === true,
      };

      // Handle skills array
      if (formData.relevantSkills && formData.relevantSkills.length > 0) {
        internshipData.relevantSkills =
          typeof formData.relevantSkills === "string"
            ? formData.relevantSkills
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill)
            : Array.isArray(formData.relevantSkills)
            ? formData.relevantSkills
            : [];
      }

      // Handle file uploads
      if (req.files.resume) {
        internshipData.resume = `/uploads/internship/resumes/${req.files.resume[0].filename}`;
      }

      if (req.files.transcript) {
        internshipData.transcript = `/uploads/internship/transcripts/${req.files.transcript[0].filename}`;
      }

      if (req.files.otherDocuments) {
        internshipData.otherDocuments = req.files.otherDocuments.map(
          (file) => ({
            name: file.originalname,
            url: `/uploads/internship/others/${file.filename}`,
          })
        );
      }

      console.log("Final internship data to save:", internshipData);

      // Create new internship
      const internship = new Internship(internshipData);
      await internship.save();

      res.status(201).json({
        success: true,
        message: "Application submitted successfully!",
        data: {
          id: internship._id,
          fullName: internship.fullName,
          email: internship.email,
          applicationDate: internship.applicationDate,
        },
      });
    } catch (error) {
      console.error("Error creating internship:", error);

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(", "),
          errors: error.errors,
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already exists. Please use a different email.",
        });
      }

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 10MB.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error submitting application. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);
// @route   PUT /api/internships/:id
// @desc    Update internship application (Admin only)
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;

    // Don't allow updating sensitive fields
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship application not found",
      });
    }

    res.json({
      success: true,
      message: "Application updated successfully",
      data: internship,
    });
  } catch (error) {
    console.error("Error updating internship:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @route   POST /api/internships/:id/upload-certificate
// @desc    Upload pre-made certificate PDF
router.post(
  "/:id/upload-certificate",
  upload.single("certificateFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a certificate file to upload",
        });
      }

      const internship = await Internship.findById(req.params.id);

      if (!internship) {
        return res.status(404).json({
          success: false,
          message: "Internship application not found",
        });
      }

      // Update certificate file path
      internship.certificateFile = `/uploads/internship/certificates/${req.file.filename}`;
      internship.certificateFileName = req.file.originalname;

      await internship.save();

      res.json({
        success: true,
        message: "Certificate uploaded successfully",
        data: {
          certificateFile: internship.certificateFile,
          certificateFileName: internship.certificateFileName,
        },
      });
    } catch (error) {
      console.error("Error uploading certificate:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading certificate",
      });
    }
  }
);

// @route   DELETE /api/internships/:id
// @desc    Delete internship application
router.delete("/:id", async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship application not found",
      });
    }

    // Soft delete
    internship.isActive = false;
    await internship.save();

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting internship:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @route   GET /api/internships/stats/summary
// @desc    Get internship statistics summary
router.get("/stats/summary", async (req, res) => {
  try {
    const [total, pending, underReview, selected, completed, rejected] =
      await Promise.all([
        Internship.countDocuments({ isActive: true }),
        Internship.countDocuments({ status: "Pending", isActive: true }),
        Internship.countDocuments({ status: "Under Review", isActive: true }),
        Internship.countDocuments({ status: "Selected", isActive: true }),
        Internship.countDocuments({ status: "Completed", isActive: true }),
        Internship.countDocuments({ status: "Rejected", isActive: true }),
      ]);

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await Internship.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true,
    });

    // Get departments with most interns
    const topDepartments = await Internship.aggregate([
      { $match: { department: { $ne: null }, isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        underReview,
        selected,
        completed,
        rejected,
        recentApplications,
        topDepartments,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @route   GET /api/internships/:id/download-certificate
// @desc    Download certificate file
router.get("/:id/download-certificate", async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship || !internship.certificateFile) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const filePath = path.join(__dirname, "..", internship.certificateFile);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Certificate file not found on server",
      });
    }

    // Set headers for download
    const fileName =
      internship.certificateFileName ||
      `Certificate-${internship.fullName.replace(/\s+/g, "-")}.pdf`;

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({
          success: false,
          message: "Error downloading certificate",
        });
      }
    });
  } catch (error) {
    console.error("Error downloading certificate:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
