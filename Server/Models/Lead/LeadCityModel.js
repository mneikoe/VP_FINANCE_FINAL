const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  }
);

module.exports = mongoose.model("City", CitySchema);
