const Registrar = require("../Models/RegistrarModel");
const FinancialProduct = require("../Models/FinancialProductModel");
const { default: mongoose } = require("mongoose");
// Create new Registrar
exports.createRegistrar = async (req, res) => {
  try {
    console.log(req.body, "Req.body registrar");
    const { financialProduct } = req.body;

    // Find the product by name
    const productExists = await FinancialProduct.findOne({
      name: financialProduct,
    });
    if (!productExists) {
      return res.status(400).json({ error: "Invalid financial Product Id" });
    }
    // Replace name with ObjectId
    req.body.financialProduct = productExists._id;

    const registrar = new Registrar(req.body);
    await registrar.save();

    res.status(201).json(registrar);
    console.log(registrar, "Saved Registrar");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Registrars
exports.getAllRegistrars = async (req, res) => {
  try {
    // const registrars = await Registrar.find();
    const registrars = await Registrar.find().populate(
      "financialProduct",
      "name"
    );

    res.status(200).json(registrars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single Registrar by ID
exports.getRegistrarById = async (req, res) => {
  try {
    const registrar = await Registrar.findById(req.params.id);
    if (!registrar)
      return res.status(404).json({ error: "Registrar not found" });
    res.status(200).json(registrar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Registrar by ID
exports.updateRegistrar = async (req, res) => {
  try {
    const { financialProduct } = req.body;

    if (financialProduct) {
      let product = null;

      // If the financialProduct is not a valid ObjectId, treat it as a name
      if (!mongoose.Types.ObjectId.isValid(financialProduct)) {
        product = await FinancialProduct.findOne({ name: financialProduct });
        if (!product) {
          return res
            .status(400)
            .json({ error: "Invalid financial Product name" });
        }
        req.body.financialProduct = product._id;
      } else {
        product = await FinancialProduct.findById(financialProduct);
        if (!product) {
          return res
            .status(400)
            .json({ error: "Invalid financial Product Id" });
        }
      }
    }

    const updatedRegistrar = await Registrar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("financialProduct");
    if (!updatedRegistrar)
      return res.status(404).json({ error: "Registrar not found" });
    res.status(200).json(updatedRegistrar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Registrar by ID
exports.deleteRegistrar = async (req, res) => {
  try {
    const deletedRegistrar = await Registrar.findByIdAndDelete(req.params.id);
    if (!deletedRegistrar)
      return res.status(404).json({ error: "Registrar not found" });
    res.status(200).json({ message: "Registrar deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
