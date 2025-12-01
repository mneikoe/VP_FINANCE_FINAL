const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  vacancy: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  platform: {
    type: String,
    required: true,

  },
  document: {
    type: String, // Path to the uploaded file
    required: true,
  },
}, { timestamps: true });

const Vacancy = mongoose.model('Vacancy', vacancySchema);

module.exports = Vacancy;