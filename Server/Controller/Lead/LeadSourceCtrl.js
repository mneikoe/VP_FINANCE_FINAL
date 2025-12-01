const Lead = require("../../Models/Lead/LeadSourceModel");

// Create Lead
const createLead = async (req, res) => {
  try {
    const { sourceName, leadTypeId } = req.body;
    const lead = await Lead.create({ sourceName, leadTypeId });
    const saveData = await lead.save();
    res.status(201).json(saveData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



// Get All Leads
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Lead
const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
};
