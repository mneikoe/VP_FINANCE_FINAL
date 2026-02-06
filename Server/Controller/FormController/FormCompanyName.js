const CompanyName = require("../../Models/Forms/CompanyName");

/* ============ CREATE ============ */
exports.createCompanyName = async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const exists = await CompanyName.findOne({ companyName });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Company name already exists",
      });
    }

    const company = await CompanyName.create({ companyName });

    res.status(201).json({
      success: true,
      message: "Company name created",
      data: company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============ READ ============ */
exports.getAllCompanyNames = async (req, res) => {
  try {
    const companies = await CompanyName.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============ UPDATE ============ */
exports.updateCompanyName = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const updatedCompany = await CompanyName.findByIdAndUpdate(
      id,
      { companyName },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company name updated",
      data: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============ DELETE ============ */
exports.deleteCompanyName = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCompany = await CompanyName.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company name deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
