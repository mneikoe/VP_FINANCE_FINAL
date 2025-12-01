const OfficePurchase = require("../Models/OfficePurchaseModel");

// Create
exports.createOfficePurchase = async (req, res) => {
  try {
    const newPurchase = new OfficePurchase(req.body);
    const savedPurchase = await newPurchase.save();
    res.status(201).json(savedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Read all
exports.getAllOfficePurchases = async (req, res) => {
  try {
    const purchases = await OfficePurchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
exports.getOfficePurchaseById = async (req, res) => {
  try {
    const purchase = await OfficePurchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Not found" });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
exports.updateOfficePurchase = async (req, res) => {
  try {
    const updatedPurchase = await OfficePurchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPurchase) return res.status(404).json({ message: "Not found" });
    res.json(updatedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete
exports.deleteOfficePurchase = async (req, res) => {
  try {
    const deletedPurchase = await OfficePurchase.findByIdAndDelete(
      req.params.id
    );
    if (!deletedPurchase) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
