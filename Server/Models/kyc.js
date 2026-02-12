const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: true,
    trim: true,
  },
  documentName: {
    type: String,
    required: true,
    trim: true,
  },
  documentNumber: {
    type: String,
    required: true,
    trim: true,
  },
  remark: {
    type: String,
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "testSchema",
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Kyc', kycSchema);