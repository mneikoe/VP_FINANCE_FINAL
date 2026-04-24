const mongoose = require("mongoose");

const Kycdocuments = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  documentNames: {
    type: [String],
    default: [],
  },

});

module.exports = mongoose.model("Kycdocument",Kycdocuments);