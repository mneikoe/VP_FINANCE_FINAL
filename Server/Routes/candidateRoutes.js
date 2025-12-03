// Routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const Candidate = require("../Models/Candidate");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/candidate-resumes");
const offerLetterDir = path.join(__dirname, "../public/offer-letters");
const joiningLetterDir = path.join(__dirname, "../public/joining-letters");

// Create directories if they don't exist
[uploadDir, offerLetterDir, joiningLetterDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Configure multer for resume upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, JPG, PNG files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Add new candidate with grading system - DEBUG VERSION
router.post("/add", upload.single("resume"), async (req, res) => {
  try {
    console.log("📥 Received request body:", req.body);
    console.log("📁 Received resume file:", req.file);

    // ✅ DEBUG: Check all fields
    console.log("🔍 Field Check:");
    console.log("candidateName:", req.body.candidateName);
    console.log("mobileNo:", req.body.mobileNo);
    console.log("appliedFor:", req.body.appliedFor);
    console.log("vehicle:", req.body.vehicle, "type:", typeof req.body.vehicle);
    console.log(
      "spokenEnglish:",
      req.body.spokenEnglish,
      "type:",
      typeof req.body.spokenEnglish
    );

    const {
      candidateName,
      mobileNo,
      email,
      designation,
      education,
      ageGroup,
      vehicle,
      location,
      nativePlace,
      spokenEnglish,
      salaryExpectation,
      administrative,
      insuranceSales,
      anySales,
      fieldWork,
      dataManagement,
      backOffice,
      mis,
      appliedFor,
      interviewDate,
    } = req.body;

    // ✅ SIMPLE VALIDATION - Remove strict checks temporarily
    if (!candidateName || !mobileNo) {
      return res.status(400).json({
        success: false,
        message: "Candidate Name and Mobile Number are required",
      });
    }

    // ✅ Check if appliedFor is valid ObjectId
    if (!appliedFor) {
      return res.status(400).json({
        success: false,
        message: "Please select a vacancy to apply for",
      });
    }

    // ✅ Convert string booleans to actual booleans
    const vehicleBool = vehicle === "true";
    const spokenEnglishBool = spokenEnglish === "true";

    const candidateData = {
      candidateName,
      mobileNo,
      email: email || "",
      designation: designation || "",
      education: education || "",
      ageGroup: ageGroup || "",
      vehicle: vehicleBool,
      location: location || "",
      nativePlace: nativePlace || "",
      spokenEnglish: spokenEnglishBool,
      salaryExpectation: salaryExpectation || "",
      experienceFields: {
        administrative: parseInt(administrative) || 0,
        insuranceSales: parseInt(insuranceSales) || 0,
        anySales: parseInt(anySales) || 0,
        fieldWork: parseInt(fieldWork) || 0,
      },
      operationalActivities: {
        dataManagement: parseInt(dataManagement) || 0,
        backOffice: parseInt(backOffice) || 0,
        mis: parseInt(mis) || 0,
      },
      appliedFor,
      interviewDate: interviewDate || null,
      currentStage: "Career Enquiry",
      currentStatus: "Career Enquiry",
      appliedDate: new Date(),
    };

    console.log("💾 Candidate data to save:", candidateData);

    if (req.file) {
      candidateData.resume = req.file.filename;
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    // Populate appliedFor details
    await candidate.populate("appliedFor", "designation");

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      candidate: {
        ...candidate.toObject(),
        totalMarks: candidate.totalMarks,
        shortlisted: candidate.shortlisted,
      },
    });
  } catch (error) {
    console.error("❌ Error adding candidate:", error);

    // ✅ More detailed error information
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
        details: error.errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding candidate",
      error: error.message,
    });
  }
});

// Update candidate stage
router.put("/:id/stage", async (req, res) => {
  try {
    const { currentStage, interviewDate } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        currentStage,
        interviewDate: interviewDate || null,
        currentStatus:
          currentStage === "Selected"
            ? "Joining Data"
            : currentStage === "Joining Data"
            ? "Joining Data"
            : currentStage,
      },
      { new: true }
    ).populate("appliedFor", "designation");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      message: `Candidate moved to ${currentStage}`,
      candidate,
    });
  } catch (error) {
    console.error("❌ Error updating candidate stage:", error);
    res.status(500).json({
      success: false,
      message: "Error updating candidate stage",
      error: error.message,
    });
  }
});

// Get candidates by stage
// Update candidate stage - FIXED VERSION
router.put("/:id/stage", async (req, res) => {
  try {
    const { currentStage, currentStatus, interviewDate } = req.body;

    // ✅ If Selected is sent, change it to Joining Data
    const stageToUpdate =
      currentStage === "Selected" ? "Joining Data" : currentStage;
    const statusToUpdate =
      currentStatus === "Selected"
        ? "Joining Data"
        : currentStatus || stageToUpdate;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        currentStage: stageToUpdate,
        currentStatus: statusToUpdate,
        interviewDate: interviewDate || null,
      },
      { new: true }
    ).populate("appliedFor", "designation");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      message: `Candidate moved to ${stageToUpdate}`,
      candidate,
    });
  } catch (error) {
    console.error("❌ Error updating candidate stage:", error);
    res.status(500).json({
      success: false,
      message: "Error updating candidate stage",
      error: error.message,
    });
  }
});

// Get all candidates
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || [],
    });
  } catch (error) {
    console.error("❌ Error fetching all candidates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Configure multer for offer letter upload
const offerLetterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, offerLetterDir);
  },
  filename: function (req, file, cb) {
    const candidateId = req.params.id;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `offer-${candidateId}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// Configure multer for joining letter upload
const joiningLetterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, joiningLetterDir);
  },
  filename: function (req, file, cb) {
    const candidateId = req.params.id;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `joining-${candidateId}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, JPG, PNG files are allowed"), false);
  }
};

const uploadOfferLetter = multer({
  storage: offerLetterStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const uploadJoiningLetter = multer({
  storage: joiningLetterStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Update offer letter status WITH FILE UPLOAD
router.put(
  "/:id/offer-letter",
  uploadOfferLetter.single("offerLetterFile"),
  async (req, res) => {
    try {
      const { sentDate, accepted } = req.body;
      const candidateId = req.params.id;

      const updateData = {
        currentStage: "Offer Letter Sent",
        currentStatus: "Offer Letter Sent",
        "offerLetterDetails.sentDate": sentDate || new Date(),
        "offerLetterDetails.accepted": accepted || false,
        ...(accepted && { "offerLetterDetails.acceptedDate": new Date() }),
      };

      // If file is uploaded, add file information
      if (req.file) {
        updateData["offerLetterDetails.file"] = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/offer-letters/${req.file.filename}`,
          uploadedDate: new Date(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
      }

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      ).populate("appliedFor", "designation");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Offer letter status updated",
        candidate,
      });
    } catch (error) {
      console.error("❌ Error updating offer letter status:", error);
      res.status(500).json({
        success: false,
        message: "Error updating offer letter status",
        error: error.message,
      });
    }
  }
);

// Update joining letter status WITH FILE UPLOAD
router.put(
  "/:id/joining-letter",
  uploadJoiningLetter.single("joiningLetterFile"),
  async (req, res) => {
    try {
      const { sentDate, received, joiningDate } = req.body;
      const candidateId = req.params.id;

      const updateData = {
        currentStage: "Joining Letter Sent",
        currentStatus: "Joining Letter Sent",
        "joiningLetterDetails.sentDate": sentDate || new Date(),
        "joiningLetterDetails.received": received || false,
        "joiningLetterDetails.joiningDate": joiningDate || null,
        ...(received && { "joiningLetterDetails.receivedDate": new Date() }),
      };

      // If file is uploaded, add file information
      if (req.file) {
        updateData["joiningLetterDetails.file"] = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/joining-letters/${req.file.filename}`,
          uploadedDate: new Date(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
      }

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      ).populate("appliedFor", "designation");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Joining letter status updated",
        candidate,
      });
    } catch (error) {
      console.error("❌ Error updating joining letter status:", error);
      res.status(500).json({
        success: false,
        message: "Error updating joining letter status",
        error: error.message,
      });
    }
  }
);

// Get candidates by specific stage with Joining Letter Sent
router.get("/stage/Joining%20Letter%20Sent", async (req, res) => {
  try {
    const candidates = await Candidate.find({
      currentStage: "Joining Letter Sent",
    })
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || [],
    });
  } catch (error) {
    console.error("❌ Error fetching Joining Letter Sent candidates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Get candidates by specific status with Joining Letter Sent
router.get("/status/Joining%20Letter%20Sent", async (req, res) => {
  try {
    const candidates = await Candidate.find({
      currentStatus: "Joining Letter Sent",
    })
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || [],
    });
  } catch (error) {
    console.error("❌ Error fetching Joining Letter Sent candidates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Get candidates by stage (ALL STAGES)
router.get("/stage/:stage", async (req, res) => {
  try {
    const stage = decodeURIComponent(req.params.stage);

    // ✅ Map URL encoded stage names to actual stage names
    const stageMapping = {
      "Career Enquiry": "Career Enquiry",
      "Resume Shortlisted": "Resume Shortlisted",
      "Interview Process": "Interview Process",
      Selected: "Selected",
      "Joining Data": "Joining Data",
      "Offer Letter Sent": "Offer Letter Sent",
      "Joining Letter Sent": "Joining Letter Sent",
      "Added as Employee": "Added as Employee",
      Rejected: "Rejected",
    };

    const stageToSearch = stageMapping[stage] || stage;

    const candidates = await Candidate.find({ currentStage: stageToSearch })
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      stage: stageToSearch,
      candidates: candidates || [],
    });
  } catch (error) {
    console.error(`❌ Error fetching ${req.params.stage} candidates:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Get candidates by status (ALL STATUSES)
router.get("/status/:status", async (req, res) => {
  try {
    const status = decodeURIComponent(req.params.status);

    // ✅ Map URL encoded status names to actual status names
    const statusMapping = {
      "Career Enquiry": "Career Enquiry",
      "Resume Shortlisted": "Resume Shortlisted",
      "Interview Process": "Interview Process",
      "Joining Data": "Joining Data",
      "Offer Letter Sent": "Offer Letter Sent",
      "Joining Letter Sent": "Joining Letter Sent",
      "Added as Employee": "Added as Employee",
      Rejected: "Rejected",
    };

    const statusToSearch = statusMapping[status] || status;

    const candidates = await Candidate.find({ currentStatus: statusToSearch })
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      status: statusToSearch,
      candidates: candidates || [],
    });
  } catch (error) {
    console.error(`❌ Error fetching ${req.params.status} candidates:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// View PDF file
router.get("/view/offer-letter/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(offerLetterDir, filename);

    if (fs.existsSync(filePath)) {
      // Check if it's a PDF
      if (filename.toLowerCase().endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      } else {
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
      }

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("❌ Error viewing offer letter:", error);
    res.status(500).json({
      success: false,
      message: "Error viewing file",
      error: error.message,
    });
  }
});

// View joining letter file
router.get("/view/joining-letter/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(joiningLetterDir, filename);

    if (fs.existsSync(filePath)) {
      // Check if it's a PDF
      if (filename.toLowerCase().endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      } else {
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
      }

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("❌ Error viewing joining letter:", error);
    res.status(500).json({
      success: false,
      message: "Error viewing file",
      error: error.message,
    });
  }
});

// Download offer letter file
router.get("/download/offer-letter/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(offerLetterDir, filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("❌ Error downloading offer letter:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading file",
      error: error.message,
    });
  }
});

// Download joining letter file
router.get("/download/joining-letter/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(joiningLetterDir, filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("❌ Error downloading joining letter:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading file",
      error: error.message,
    });
  }
});
// Routes/candidateRoutes.js में ये routes add करें:

// Get ALL candidates (with proper population)
router.get("/all", async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || [],
      count: candidates.length,
    });
  } catch (error) {
    console.error("❌ Error fetching all candidates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Get candidates with files
router.get("/with-files", async (req, res) => {
  try {
    const candidates = await Candidate.find({
      $or: [
        { "offerLetterDetails.file": { $exists: true, $ne: null } },
        { "joiningLetterDetails.file": { $exists: true, $ne: null } },
      ],
    })
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || [],
      count: candidates.length,
    });
  } catch (error) {
    console.error("❌ Error fetching candidates with files:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Get candidates by multiple stages
router.get("/stages/:stages", async (req, res) => {
  try {
    const stagesParam = decodeURIComponent(req.params.stages);
    const stages = stagesParam.split(",").map((stage) => stage.trim());

    console.log("📊 Fetching candidates for stages:", stages);

    const candidates = await Candidate.find({
      $or: [
        { currentStage: { $in: stages } },
        { currentStatus: { $in: stages } },
      ],
    })
      .populate("appliedFor", "designation")
      .sort({ appliedDate: -1 });

    console.log(`✅ Found ${candidates.length} candidates`);

    res.json({
      success: true,
      stages: stages,
      candidates: candidates || [],
      count: candidates.length,
    });
  } catch (error) {
    console.error(`❌ Error fetching candidates for stages:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message,
    });
  }
});

// Routes/candidateRoutes.js में निम्न routes add करें:

// Update offer letter status WITH PDF UPLOAD - ENHANCED VERSION
router.put(
  "/:id/offer-letter",
  uploadOfferLetter.single("offerLetterFile"),
  async (req, res) => {
    try {
      const { sentDate, accepted, notes } = req.body;
      const candidateId = req.params.id;

      const updateData = {
        currentStage: "Offer Letter Sent",
        currentStatus: "Offer Letter Sent",
        "offerLetterDetails.sentDate": sentDate || new Date(),
        "offerLetterDetails.accepted": accepted === "true" || false,
        "offerLetterDetails.notes": notes || "",
      };

      // If file is uploaded, add file information
      if (req.file) {
        updateData["offerLetterDetails.file"] = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/offer-letters/${req.file.filename}`,
          uploadedDate: new Date(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
      }

      // If accepted, set accepted date
      if (accepted === "true") {
        updateData["offerLetterDetails.acceptedDate"] = new Date();
      }

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      ).populate("appliedFor", "designation");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Offer letter status updated",
        candidate,
      });
    } catch (error) {
      console.error("❌ Error updating offer letter status:", error);
      res.status(500).json({
        success: false,
        message: "Error updating offer letter status",
        error: error.message,
      });
    }
  }
);

// Update joining letter status WITH PDF UPLOAD - FIXED VERSION
router.put(
  "/:id/joining-letter",
  uploadJoiningLetter.single("joiningLetterFile"),
  async (req, res) => {
    try {
      const { sentDate, received, joiningDate, notes } = req.body;
      const candidateId = req.params.id;

      const updateData = {
        currentStage: "Joining Letter Sent",
        currentStatus: "Joining Letter Sent",
        "joiningLetterDetails.sentDate": sentDate || new Date(),
        "joiningLetterDetails.received": received === "true" || false,
        "joiningLetterDetails.notes": notes || "",
      };

      // ✅ FIX: joiningDate को properly handle करें
      if (joiningDate && joiningDate.trim() !== "" && joiningDate !== "null") {
        try {
          updateData["joiningLetterDetails.joiningDate"] = new Date(
            joiningDate
          );
        } catch (error) {
          console.log("Invalid joining date, using null:", error);
          updateData["joiningLetterDetails.joiningDate"] = null;
        }
      } else {
        updateData["joiningLetterDetails.joiningDate"] = null;
      }

      // If file is uploaded, add file information
      if (req.file) {
        updateData["joiningLetterDetails.file"] = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/joining-letters/${req.file.filename}`,
          uploadedDate: new Date(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
      }

      // If received, set received date
      if (received === "true") {
        updateData["joiningLetterDetails.receivedDate"] = new Date();
      }

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      ).populate("appliedFor", "designation");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Joining letter status updated",
        candidate,
      });
    } catch (error) {
      console.error("❌ Error updating joining letter status:", error);
      res.status(500).json({
        success: false,
        message: "Error updating joining letter status",
        error: error.message,
      });
    }
  }
);

// Update candidate as employee
router.put("/:id/add-as-employee", async (req, res) => {
  try {
    const { employeeId, joiningDate, department, designation, salary } =
      req.body;
    const candidateId = req.params.id;

    const updateData = {
      currentStage: "Added as Employee",
      currentStatus: "Added as Employee",
      employeeDetails: {
        employeeId,
        joiningDate: joiningDate || new Date(),
        department,
        designation,
        salary,
        addedDate: new Date(),
      },
    };

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      updateData,
      { new: true }
    ).populate("appliedFor", "designation");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      message: "Candidate added as employee successfully",
      candidate,
    });
  } catch (error) {
    console.error("❌ Error adding candidate as employee:", error);
    res.status(500).json({
      success: false,
      message: "Error adding candidate as employee",
      error: error.message,
    });
  }
});

// Get offer letter file details
router.get("/:id/offer-letter", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).select(
      "offerLetterDetails candidateName mobileNo email"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      offerLetter: candidate.offerLetterDetails,
      candidate: {
        name: candidate.candidateName,
        mobile: candidate.mobileNo,
        email: candidate.email,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching offer letter details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching offer letter details",
      error: error.message,
    });
  }
});

// Get joining letter file details
router.get("/:id/joining-letter", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).select(
      "joiningLetterDetails candidateName mobileNo email"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      joiningLetter: candidate.joiningLetterDetails,
      candidate: {
        name: candidate.candidateName,
        mobile: candidate.mobileNo,
        email: candidate.email,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching joining letter details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching joining letter details",
      error: error.message,
    });
  }
});

// Upload offer letter without changing status (just PDF upload)
router.post(
  "/:id/upload-offer-letter",
  uploadOfferLetter.single("offerLetterFile"),
  async (req, res) => {
    try {
      const candidateId = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const updateData = {
        "offerLetterDetails.file": {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/offer-letters/${req.file.filename}`,
          uploadedDate: new Date(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        },
      };

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      ).populate("appliedFor", "designation");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Offer letter uploaded successfully",
        candidate,
      });
    } catch (error) {
      console.error("❌ Error uploading offer letter:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading offer letter",
        error: error.message,
      });
    }
  }
);

// Upload joining letter without changing status (just PDF upload)
router.post(
  "/:id/upload-joining-letter",
  uploadJoiningLetter.single("joiningLetterFile"),
  async (req, res) => {
    try {
      const candidateId = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const updateData = {
        "joiningLetterDetails.file": {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/joining-letters/${req.file.filename}`,
          uploadedDate: new Date(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        },
      };

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      ).populate("appliedFor", "designation");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Joining letter uploaded successfully",
        candidate,
      });
    } catch (error) {
      console.error("❌ Error uploading joining letter:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading joining letter",
        error: error.message,
      });
    }
  }
);

// Delete offer letter file
router.delete("/:id/offer-letter", async (req, res) => {
  try {
    const candidateId = req.params.id;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Delete file from disk if exists
    if (candidate.offerLetterDetails?.file?.filename) {
      const filePath = path.join(
        offerLetterDir,
        candidate.offerLetterDetails.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove file details from database
    candidate.offerLetterDetails.file = null;
    await candidate.save();

    res.json({
      success: true,
      message: "Offer letter file deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting offer letter:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting offer letter",
      error: error.message,
    });
  }
});

// Delete joining letter file
router.delete("/:id/joining-letter", async (req, res) => {
  try {
    const candidateId = req.params.id;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Delete file from disk if exists
    if (candidate.joiningLetterDetails?.file?.filename) {
      const filePath = path.join(
        joiningLetterDir,
        candidate.joiningLetterDetails.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove file details from database
    candidate.joiningLetterDetails.file = null;
    await candidate.save();

    res.json({
      success: true,
      message: "Joining letter file deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting joining letter:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting joining letter",
      error: error.message,
    });
  }
});
module.exports = router;
