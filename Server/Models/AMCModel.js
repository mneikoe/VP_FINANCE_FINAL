const mongoose = require("mongoose");

const amcSchema = new mongoose.Schema(
  {
    registrar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registrar",
      required: true,
    },
    amcName: { type: String, required: true },
    localAddress: { type: String },
    contactNo: { type: Number },
    email: { type: String },

    branchManagerName: { type: String },
    branchManagerMobile: { type: Number },

    headOfficeAddress: { type: String },
    headOfficeContact: { type: Number },
    headOfficeEmail: { type: String },

    website: { type: String },

    rmName: { type: String },
    rmDob: { type: Date },
    rmMobile: { type: Number },
    rmEmail: { type: String },

    portalLink: { type: String },
    alternatePortalLink: { type: String },

    loginName1: { type: String },
    username1: { type: String },
    password1: { type: String },

    loginName2: { type: String },
    username2: { type: String },
    password2: { type: String },

    loginName3: { type: String },
    username3: { type: String },
    password3: { type: String },

    appName1: { type: String },
    appUsername1: { type: String },
    appPassword1: { type: String },

    appName2: { type: String },
    appUsername2: { type: String },
    appPassword2: { type: String },

    extraRemark: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and up{ type : Date}dAt fields
  }
);

module.exports = mongoose.model("AMC", amcSchema);
