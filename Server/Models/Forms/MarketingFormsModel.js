const mongoose = require("mongoose");

const MarketingFormsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

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

    kindOfForm: {
      type: String,
      required: true,
      enum: [
        "life_insurance",
        "mutual_fund",
        "real_estate",
        "health_insurance",
      ],
    },

    file: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MarketingForm",
  MarketingFormsSchema
);
