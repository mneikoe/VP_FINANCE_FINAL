
const mongoose = require("mongoose");

const leadAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortcode: { type: String, required: true },
  pincode: { type: Number, required: true },
  city:{ type: String, required: true }
});

module.exports = mongoose.model("LeadArea", leadAreaSchema);