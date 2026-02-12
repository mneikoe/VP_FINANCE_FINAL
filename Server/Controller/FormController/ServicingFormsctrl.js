const ServicingForms = require("../../Models/Forms/ServicingFormsModel");

const createServicingForm = async (req, res) => {
  try {
    const { formName, formType, companyName, kindOfForm } = req.body;

    // validate required fields
    if (!formName || !formType || !companyName || !kindOfForm) {
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

    const form = await ServicingForms.create({
      formName,
      formType,
      companyName,
      kindOfForm,
      file: req.file.filename,
    });

    res.status(201).json({
      success: true,
      form: {
        ...form.toObject(),
        fileUrl: `/forms/${form.file}`,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { createServicingForm };


const getServicingForms = async (req, res) => {
  try {
    const forms = await ServicingForms.find().sort({
      createdAt: -1,
    });

    res.json({ success: true, forms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getServicingFormsByKind = async (req, res) => {
  try {
    const { kindOfForm } = req.params;

    const forms = await ServicingForms.find({
      kindOfForm: {
        $regex: `^${kindOfForm}$`,
        $options: "i",
      },
    });

    res.json({ success: true, forms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateServicingForm = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.file = req.file.filename;
    }

    const form = await ServicingForms.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, form });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const deleteServicingForm = async (req, res) => {
  try {
    await ServicingForms.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Servicing form deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createServicingForm,
  getServicingForms,
  getServicingFormsByKind,
  updateServicingForm,
  deleteServicingForm,
};
