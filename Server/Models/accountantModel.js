const mongoose = require("mongoose");

const accountantSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobileno: { type: String, required: true, unique: true },
    role: { type: String, default: "Accountant", immutable: true },
  },
  { timestamps: true }
);

const accountant = mongoose.model("Accountant", accountantSchema);

module.exports = accountant;