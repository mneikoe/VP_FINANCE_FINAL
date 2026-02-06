const MarketingForm = require("../../Models/Forms/MarketingFormsModel");

/**
 * CREATE MARKETING FORM
 */
const createMarketingForm = async (req, res) => {
  try {
    const { companyName, formName, formType, kindOfForm } = req.body;

    if (!companyName || !formName || !formType || !kindOfForm) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const form = await MarketingForm.create({
      companyName,
      formName,
      formType,
      kindOfForm,
      file: req.file.path,
    });

    return res.status(201).json({
      success: true,
      message: "Marketing form created successfully",
      form,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL MARKETING FORMS
 */
const getAllMarketingForms = async (req, res) => {
  try {
    const forms = await MarketingForm.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      forms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET FORMS BY KIND OF FORM
 */
const getFormsByKindOfForm = async (req, res) => {
  try {
    const { kindOfForm } = req.params;

    const forms = await MarketingForm.find({ kindOfForm }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      forms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE MARKETING FORM
 */
const updateMarketingForm = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.file = req.file.path;
    }

    const form = await MarketingForm.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marketing form updated successfully",
      form,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE MARKETING FORM
 */
const deleteMarketingForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await MarketingForm.findByIdAndDelete(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marketing form deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMarketingForm,
  getAllMarketingForms,
  getFormsByKindOfForm,
  updateMarketingForm,
  deleteMarketingForm,
};
