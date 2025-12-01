
const mongoose = require("mongoose");
const Occupation = require("../../Models/Lead/LeadOccupationModel");



// Create Occupation
const createOccupation = async (req, res) => {
  try {
    const { occupationName, occupationType } = req.body;
    
    // Validate required fields
    if (!occupationName || ! occupationType) {
      return res.status(400).json({ 
        error: "occupationName and occupationType are required",
        success: false 
      });
    }
  
  
    const lead = await Occupation.create({
      occupationName,
      occupationType
    });
    

    res.status(201).json({
      success: true,
      message: "Lead occupation created successfully",
      data: lead
    });
  } catch (err) {
    console.error("Error creating lead occupation:", err);
    res.status(400).json({ 
      error: err.message,
      success: false 
    });
  }
};




// Get All Lead Occupations
const getAllOccupations = async (req, res) => {
  try {
    const leads = await Occupation.find()
      .populate('occupationType')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (err) {
    console.error("Error fetching lead occupations:", err);
    res.status(500).json({ 
      error: err.message,
      success: false 
    });
  }
};

const getOccupationById = async(req, res)=>{
  try {

    const {id} = req.params;

    if(! id){
      return res.status(400).json({
        error: "Lead occupation ID is required",
        success: false
      });
    }

    const Lead = await Occupation.findById(id).populate('occupationType');
    if (!Lead) {
      return res.status(404).json({
        error: "Lead occupation not found",
        success: false
      });
    }

    res.status(200).json({
      success: true,  
      data: Lead
    });


  } catch (error) {
    console.warn("Error fetching lead occupation by ID:", error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
    
  }
}



// Update Lead Occupation
const updateOccupation = async (req, res) => {
  try {
    const lead = await Occupation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({success: true, data: lead});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Delete Lead Occupation
const deleteOccupation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid lead occupation ID format",
        success: false
      });
    }
    
    const lead = await Occupation.findByIdAndDelete(id);
    
    if (!lead) {
      return res.status(404).json({
        error: "Lead occupation not found",
        success: false
      });
    }
    
    // Log for audit purposes
    console.log(`Deleted lead occupation ${id}`);
    
    res.status(200).json({ 
      message: "Lead occupation deleted successfully",
      success: true 
    });
  } catch (err) {
    console.error("Error deleting lead occupation:", err);
    res.status(500).json({ 
      error: err.message,
      success: false 
    });
  }
};



module.exports = {
  createOccupation,
  getAllOccupations,
  getOccupationById,
  updateOccupation,
  deleteOccupation,
};














