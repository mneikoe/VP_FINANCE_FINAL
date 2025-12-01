
const mongoose = require("mongoose");

const LeadSubAreaSchema = new mongoose.Schema({
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeadArea",
    required: true,
  },
  subAreaName: { type: String, required: true },
});

module.exports = mongoose.model("LeadSubArea", LeadSubAreaSchema);