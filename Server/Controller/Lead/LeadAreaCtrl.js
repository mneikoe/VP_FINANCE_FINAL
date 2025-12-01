const Area = require("../../Models/Lead/LeadAreaModel");
const SubArea = require("../../Models/Lead/LeadSubAreaModel");
const mongoose = require("mongoose");

exports.getAllAreas = async (req, res) => {
  const areas = await Area.find();
  res.json(areas);
};

exports.createArea = async (req, res) => {
  try {
    const { name, shortcode, pincode, city } = req.body;

    // ✅ Validate required fields
    if (!name || !shortcode || !pincode || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, Shortcode, Pincode and City are required",
      });
    }

    // ✅ Validate pincode (only numbers and 6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be a 6-digit number",
      });
    }

    // ✅ Check for duplicate (same pincode + name)
    const existingArea = await Area.findOne({ pincode, name });
    if (existingArea) {
      return res.status(409).json({
        success: false,
        message: "Area with this name and pincode already exists",
      });
    }

    // ✅ Save new area
    const newLeadArea = new Area({
      name: name.trim(),
      shortcode: shortcode.toUpperCase().trim(),
      pincode,
      city: city.trim(),
    });

    await newLeadArea.save();

    return res.status(201).json({
      success: true,
      message: "Area created successfully",
      data: newLeadArea,
    });
  } catch (error) {
    console.error("Error creating area:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating area",
      error: error.message,
    });
  }
};

exports.getAreaById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }
    res.json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Area.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// exports.deleteArea = async (req, res) => {
//   const { id } = req.params;
//   await Area.findByIdAndDelete(id);
//   res.json({ message: "Area deleted" });
// };



exports.deleteArea = async (req, res) => {
  const { id } = req.params;

  try {

    if(! id){
      return res.status(400).json({
        message: "Area ID is required",
        success: false
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid area ID format",
        success: false
      });
    }

    // Check if area exists first
    const area = await Area.findById(id);
    if (!area) {
      return res.status(404).json({
        message: "Area not found",
        success: false
      });
    }
    
    // Delete all sub-areas associated with this area first
    const deletedSubAreas = await SubArea.deleteMany({ areaId: id });
    
    // Then delete the main area
    await Area.findByIdAndDelete(id);
    
    // Log for audit purposes
    console.log(`Deleted area ${id} and ${deletedSubAreas.deletedCount} associated sub-areas`);
    
    res.status(200).json({
      message: `Area deleted successfully`,
      success: true,
    });
    
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete area",
      success: false,
      error: error.message
    });
  }
};
