const CallingPurpose = require("../Models/CallingPurposeModel");

exports.createCallingPurpose = async (req, res) => {
  const { purposeName } = req.body;
  if (!purposeName) {
    return res.status(400).json({ error: "purposeName is required" });
  }

  try {
    const newCallingPurpose = new CallingPurpose({ purposeName });
    await newCallingPurpose.save();
    res.status(201).json(newCallingPurpose);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCallingPurposes = async (_req, res) => {
  try {
    const purposes = await CallingPurpose.find().sort({ purposeName: 1 });
    res.json(purposes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCallingPurposeById = async (req, res) => {
  const { id } = req.params;
  try {
    const purpose = await CallingPurpose.findById(id);
    if (!purpose) {
      return res.status(404).json({ error: "Calling purpose not found" });
    }
    res.json(purpose);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCallingPurpose = async (req, res) => {
  const { id } = req.params;
  const { purposeName } = req.body;
  if (!purposeName) {
    return res.status(400).json({ error: "purposeName is required" });
  }

  try {
    const updatedPurpose = await CallingPurpose.findByIdAndUpdate(
      id,
      { purposeName },
      { new: true }
    );
    if (!updatedPurpose) {
      return res.status(404).json({ error: "Calling purpose not found" });
    }
    res.json(updatedPurpose);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCallingPurpose = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPurpose = await CallingPurpose.findByIdAndDelete(id);
    if (!deletedPurpose) {
      return res.status(404).json({ error: "Calling purpose not found" });
    }
    res.json({ message: "Calling purpose deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
