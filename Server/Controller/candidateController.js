const Candidate = require("../Models/candidateModel");

// ✅ Create a new candidate
exports.addCandidate = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      city,
      qualification,
      experience,
      designation,
      referralSource,
      salary,
      training,
      noticePeriod,
      status,
    } = req.body;

    if (!name || !mobile || !email) {
      return res.status(400).json({ message: "Name, mobile, and email are required" });
    }

    // handle file upload
    let resumeUrl = null;
    if (req.file) {
      resumeUrl = `${req.protocol}://${req.get("host")}/Images/${req.file.filename}`;
    }

    const candidate = new Candidate({
      name,
      mobile,
      email,
      city,
      qualification,
      experience,
      designation,
      referralSource,
      salary,
      training,
      noticePeriod,
      status,
      resumeUrl,
    });

    await candidate.save();

    res.status(201).json({ message: "Candidate added successfully", data: candidate });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Failed to add candidate", error: error.message });
  }
};

// ✅ Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};

// ✅ Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete candidate", error: error.message });
  }
};


exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({
      message: "Candidate status updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};