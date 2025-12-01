const FinancialProduct = require("../Models/FinancialProductModel");

// Create
exports.createProduct = async (req, res) => {
  console.log(req.body, "HHHH");

  try {
    const product = new FinancialProduct(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All
exports.getProducts = async (req, res) => {
  try {
    const products = await FinancialProduct.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await FinancialProduct.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await FinancialProduct.findByIdAndUpdate(
      id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await FinancialProduct.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};