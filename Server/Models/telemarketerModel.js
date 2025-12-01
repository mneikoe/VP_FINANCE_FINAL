const mongoose = require("mongoose");

const telemarketerSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileno: { type: String, required: true, unique: true },
    role:{type: String}
}, { timestamps: true });

const Telemarketer = mongoose.model("Telemarketer", telemarketerSchema);

module.exports = Telemarketer; 