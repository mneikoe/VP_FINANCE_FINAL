const mongoose = require("mongoose");

const RegistrarSchema = new mongoose.Schema(
  {
    financialProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProduct",
      required: true,
    },
    arn1: String,
    euin1: String,
    expiry1: Date,

    nimsEmail1: String,
    nimsPassword1: String,

    arn2: String,
    euin2: String,
    expiry2: Date,

    nimsEmail2: String,
    nimsPassword2: String,

    registrarName: String,
    localOfficeAddress: String,
    contactNo: Number,
    emailId: String,

    branchManager: String,
    branchManagerMobile: Number,
    headOfficeAddress: String,
    headOfficeContact: Number,

    headOfficeEmail: String,
    website: String,

    rmName: String,
    rmDOB: Date,
    rmMobile: Number,
    rmEmail: String,

    portalLink: String,
    altPortalLink: String,

    loginName1: String,
    username1: String,
    password1: String,

    loginName2: String,
    username2: String,
    password2: String,

    loginName3: String,
    username3: String,
    password3: String,

    appName1: String,
    appUsername1: String,
    appPassword1: String,

    appName2: String,
    appUsername2: String,
    appPassword2: String,

    remark: String,
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registrar", RegistrarSchema);
