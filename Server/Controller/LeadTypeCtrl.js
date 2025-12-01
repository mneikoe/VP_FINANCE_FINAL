const LeadType = require("../Models/LeadTypeModel");

// Create a new leadType
exports.createleadType = async (req, res) => {
  const { leadType } = req.body;

  if (!leadType) {
    return res.status(400).json({ error: "leadType name is required" });
  }

  try {
    const newLeadType = new LeadType({ leadType });
    await newLeadType.save();
    res.status(201).json(newLeadType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all leadTypes
exports.getAllleadTypes = async (req, res) => {
  try {
    const leadTypes = await LeadType.find();
    res.json(leadTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single leadType by ID
exports.getleadTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const leadType = await LeadType.findById(id);
    if (!leadType) {
      return res.status(404).json({ error: "leadType not found" });
    }
    res.json(leadType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a leadType by ID
exports.updateleadType = async (req, res) => {
  const { id } = req.params;
  const { leadType } = req.body;

  if (!leadType) {
    return res.status(400).json({ error: "leadType name is required" });
  }

  try {
    const updatedLeadType = await LeadType.findByIdAndUpdate(
      id,
      { leadType },
      { new: true } // Returns the updated leadType document
    );

    if (!updatedLeadType) {
      return res.status(404).json({ error: "leadType not found" });
    }

    res.json(updatedLeadType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a leadType by ID
exports.deleteleadType = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLeadType = await LeadType.findByIdAndDelete(id);
    if (!deletedLeadType) {
      return res.status(404).json({ error: "leadType not found" });
    }
    res.json({ message: "leadType deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
