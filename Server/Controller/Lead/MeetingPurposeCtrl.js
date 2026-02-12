const MeetingPurpose = require("../../Models/Lead/MeetingPurposeModel");

// CREATE
const createMeetingPurpose = async (req, res) => {
  try {
    const { meetingPurposeName } = req.body;

    if (!meetingPurposeName) {
      return res
        .status(400)
        .json({ message: "Meeting purpose name is required" });
    }

    const exists = await MeetingPurpose.findOne({ meetingPurposeName });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Meeting purpose already exists" });
    }

    const data = await MeetingPurpose.create({ meetingPurposeName });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
const getAllMeetingPurposes = async (req, res) => {
  try {
    const data = await MeetingPurpose.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BY ID
const getMeetingPurposeById = async (req, res) => {
  try {
    const data = await MeetingPurpose.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Meeting purpose not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
const updateMeetingPurpose = async (req, res) => {
  try {
    const updated = await MeetingPurpose.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Meeting purpose not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
const deleteMeetingPurpose = async (req, res) => {
  try {
    const deleted = await MeetingPurpose.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Meeting purpose not found" });
    }

    res.status(200).json({ message: "Meeting purpose deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createMeetingPurpose,
  getAllMeetingPurposes,
  getMeetingPurposeById,
  updateMeetingPurpose,
  deleteMeetingPurpose,
};
