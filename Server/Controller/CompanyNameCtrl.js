/* This code snippet is a part of a Node.js application that defines a controller function for creating
a new company in the database. Here's a breakdown of what the code is doing: */
const FinancialProduct = require("../Models/FinancialProductModel");
const Company = require("../Models/CompanyNameModel");

exports.createCompanyName = async (req, res) => {
  try {
    console.log(req.body, "dkfjsdklfjs");
    const { financialProduct } = req.body;

    const productExists = await FinancialProduct.findById(financialProduct);
    if (!productExists) {
      return res.status(400).json({ error: "Invalid financial Product Id" });
    }

    const company = new Company(req.body);
    await company.save();

    const populatedCompany = await Company.findById(company._id).populate(
      "financialProduct"
    );

    res.status(201).json(populatedCompany);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate("financialProduct");
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { financialProduct } = req.body;

    if (financialProduct) {
      const productExists = await FinancialProduct.findById(financialProduct);
      if (!productExists) {
        return res.status(400).json({ error: "Invalid financial Product Id" });
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("financialProduct");

    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "financialProduct"
    );

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);

    if (!deletedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
