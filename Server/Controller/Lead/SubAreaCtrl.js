const SubArea = require("../../Models/Lead/LeadSubAreaModel");

exports.getAllSubAreas = async (req, res) => {
  try {
    const subAreas = await SubArea.find().populate(
      "areaId",
      "name pincode shortcode"
    );
    res.json(subAreas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubArea = async (req, res) => {
  const { areaId, subAreaName } = req.body; // ✅ use areaId

  if (!areaId || !subAreaName) {
    return res
      .status(400)
      .json({ error: "areaId and subAreaName are required" });
  }

  try {
    const newSubArea = new SubArea({ areaId, subAreaName }); // ✅ correct key name
    await newSubArea.save();
    res.status(201).json(newSubArea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubArea = async (req, res) => {
  const { id } = req.params;
  const updated = await SubArea.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
};

exports.deleteSubArea = async (req, res) => {
  const { id } = req.params;
  await SubArea.findByIdAndDelete(id);
  res.json({ message: "SubArea deleted" });
};
