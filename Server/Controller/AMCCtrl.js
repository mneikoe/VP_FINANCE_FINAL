const { default: mongoose } = require("mongoose");
const AMC = require("../Models/AMCModel");
const Registrar = require("../Models/RegistrarModel");

// Create a new AMC
exports.createAMC = async (req, res) => {
  try {
    console.log(req.body, "Req.body AMC");
    const { registrar } = req.body;

    // Find registrar by _id (ObjectId)
    const registrarExists = await Registrar.findById(registrar);

    if (!registrarExists) {
      return res.status(400).json({ error: "Invalid Registrar Id" });
    }

    // registrar is already ObjectId string, no need to convert again
    // just continue saving
    const newAMC = new AMC(req.body);
    const savedAMC = await newAMC.save();
    res.status(201).json(savedAMC);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create AMC", error: error.message });
  }
};

// Get all AMCs
exports.getAllAMCs = async (req, res) => {
  try {
    const amcs = await AMC.find().populate("registrar", "registrarName"); // populate registrar if needed
    res.status(200).json(amcs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch AMCs", error: error.message });
  }
};

// Get AMC by ID
exports.getAMCById = async (req, res) => {
  try {
    const amc = await AMC.findById(req.params.id).populate(
      "registrar",
      "registrarName"
    );
    if (!amc) {
      return res.status(404).json({ message: "AMC not found" });
    }
    res.status(200).json(amc);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch AMC", error: error.message });
  }
};

// Update AMC by ID
exports.updateAMC = async (req, res) => {
  try {
    const { registrar } = req.body;

    if (registrar) {
      let registrarDoc = null;

      // Agar registrar valid ObjectId nahi hai to registrarName ke roop mein treat karo
      if (!mongoose.Types.ObjectId.isValid(registrar)) {
        registrarDoc = await Registrar.findOne({ registrarName: registrar });
        if (!registrarDoc) {
          return res.status(400).json({ error: "Invalid Registrar Name" });
        }
        req.body.registrar = registrarDoc._id;
      } else {
        // Agar ObjectId valid hai to Registrar exist karta hai ya nahi check karo
        registrarDoc = await Registrar.findById(registrar);
        if (!registrarDoc) {
          return res.status(400).json({ error: "Invalid Registrar Id" });
        }
      }
    }

    const updatedAMC = await AMC.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("registrar", "registrarName");

    if (!updatedAMC) {
      return res.status(404).json({ message: "AMC not found" });
    }

    res.status(200).json(updatedAMC);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update AMC", error: error.message });
  }
};

// Delete AMC by ID
exports.deleteAMC = async (req, res) => {
  try {
    const deletedAMC = await AMC.findByIdAndDelete(req.params.id);
    if (!deletedAMC) {
      return res.status(404).json({ message: "AMC not found" });
    }
    res.status(200).json({ message: "AMC deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete AMC", error: error.message });
  }
};
