const mongoose = require("mongoose");

const servicingFormsSchema = new mongoose.Schema(
  {
    formName: {
      type: String,
      required: true,
      trim: true,
    },

    formType: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    kindOfForm: {
      type: String,
      enum: [
        "life insurance",
        "health insurance",
        "real estate",
        "mutual fund",
      ],
      required: true,
    },

    file: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ServicingForms",
  servicingFormsSchema
);
