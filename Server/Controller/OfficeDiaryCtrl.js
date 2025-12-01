const OfficeDiary = require("../Models/OfficeDiaryModel");
const fs = require("fs");
const path = require("path");

// CREATE
exports.createDiary = async (req, res) => {
  try {
    const {
      orgName,
      servicePerson,
      contactNo,
      licanceNo,
      startDate,
      endDate,
      purchageDate,
      amount,
      userId,
      password,
      particulars,
    } = req.body;

    if (!orgName) {
      return res.status(400).json({ message: "Org. Name is required" });
    }

    if (!req.files || !req.files.diaryPdf || req.files.diaryPdf.length === 0) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const pdfFile = req.files.diaryPdf[0];

    const newEntry = new OfficeDiary({
      orgName,
      servicePerson,
      contactNo,
      licanceNo,
      startDate,
      endDate,
      purchageDate,
      amount,
      userId,
      password,
      particulars,
      pdfPath: `/public/Images/${pdfFile.filename}`,
    });

    await newEntry.save();
    res.status(201).json({ message: "Diary created", data: newEntry });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// READ ALL
exports.getAllDiaries = async (req, res) => {
  try {
    const diaries = await OfficeDiary.find().sort({ uploadedAt: -1 });
    res.status(200).json(diaries);
  } catch (error) {
    console.error("Read all error:", error);
    res.status(500).json({ message: "Failed to fetch diaries" });
  }
};

// READ ONE
exports.getDiaryById = async (req, res) => {
  try {
    const diary = await OfficeDiary.findById(req.params.id);
    if (!diary) return res.status(404).json({ message: "Not found" });
    res.status(200).json(diary);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch diary" });
  }
};

// UPDATE
exports.updateDiary = async (req, res) => {
  try {
    const diary = await OfficeDiary.findById(req.params.id);
    if (!diary) return res.status(404).json({ message: "Diary not found" });

    const {
      orgName,
      servicePerson,
      contactNo,
      licanceNo,
      startDate,
      endDate,
      purchageDate,
      amount,
      userId,
      password,
      particulars,
    } = req.body;

    if (req.files?.diaryPdf?.length > 0) {
      const newPdf = req.files.diaryPdf[0];

      // Delete old file
      const oldPath = path.join(__dirname, "..", diary.pdfPath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      diary.pdfPath = `/public/Images/${newPdf.filename}`;
    }

    // Update fields
    diary.orgName = orgName ?? diary.orgName;
    diary.servicePerson = servicePerson ?? diary.servicePerson;
    diary.contactNo = contactNo ?? diary.contactNo;
    diary.licanceNo = licanceNo ?? diary.licanceNo;
    diary.startDate = startDate ?? diary.startDate;
    diary.endDate = endDate ?? diary.endDate;
    diary.purchageDate = purchageDate ?? diary.purchageDate;
    diary.amount = amount ?? diary.amount;
    diary.userId = userId ?? diary.userId;
    diary.password = password ?? diary.password;
    diary.particulars = particulars ?? diary.particulars;

    await diary.save();
    res.status(200).json({ message: "Diary updated", data: diary });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteDiary = async (req, res) => {
  try {
    const diary = await OfficeDiary.findById(req.params.id);
    if (!diary) return res.status(404).json({ message: "Diary not found" });

    // Delete PDF file
    const filePath = path.join(__dirname, "..", diary.pdfPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await diary.deleteOne();
    res.status(200).json({ message: "Diary deleted", id: req.params.id });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
