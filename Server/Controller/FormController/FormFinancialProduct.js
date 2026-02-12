const DepartmentFinancialProduct = require(
  "../../Models/Forms/DepartmentFinancialProduct"
);

// ============================
// CREATE
// ============================
exports.createDepartmentFinancialProduct = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const existing = await DepartmentFinancialProduct.findOne({
      name: name.trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Department Financial Product already exists",
      });
    }

    const product = await DepartmentFinancialProduct.create({
      name: name.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// GET ALL
// ============================
exports.getAllDepartmentFinancialProducts = async (req, res) => {
  try {
    const products = await DepartmentFinancialProduct.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// GET SINGLE BY ID
// ============================
exports.getDepartmentFinancialProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await DepartmentFinancialProduct.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// UPDATE
// ============================
exports.updateDepartmentFinancialProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const updated = await DepartmentFinancialProduct.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// DELETE
// ============================
exports.deleteDepartmentFinancialProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted =
      await DepartmentFinancialProduct.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
