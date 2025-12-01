const mongoose = require("mongoose");

const Kycdocuments = new mongoose.Schema({
  name: { type: String, required: true },

});

module.exports = mongoose.model("Kycdocument",Kycdocuments);