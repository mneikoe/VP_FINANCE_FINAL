const prospectModel = require("../Models/SusProsClientSchema");
const generateAndStoreGroupCode = require("../utils/generateGroupCode");


// Create a new prospect
exports.createProspect = async (req, res) => {
  try {
    // Check if request body has data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(401).json({
        error: "No Suspect data provided in request body",
      });
    }

    const prospectData = { ...req.body, status: "prospect" };
    const newProspect = new prospectModel(prospectData);
    const savedProspect = await newProspect.save();

    if (!savedProspect || !savedProspect._id) {
      return res.status(500).json({
        error: "Failed to save Prospect data properly",
      });
    }

    const groupCode = await generateAndStoreGroupCode(savedProspect._id.toString());
    if (!savedProspect.personalDetails) {
      savedProspect.personalDetails = {};
    }
    savedProspect.personalDetails.groupCode = groupCode;
    await savedProspect.save();

    res.status(201).json(savedProspect);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create Prospect form",
      details: err.message,
    });
  }
};




// Get all prospects
exports.getAllProspects = async (req, res) => {
  try {
    const allProspects = await prospectModel.find({ status: "prospect" });
   if(allProspects.length === 0) return res.status(404).json({success : false, message: "No Prospects found"});
    res.status(200).json({success : true, prospects: allProspects});
   } catch (error) {
      console.error(error);
      res.status(500).json({success : false, message: "Server error while fetching Suspects", error: error.message});

    }
}



// Get a single prospect by ID
exports.getProspectById = async(req, res)=>{
  try {
    const {id} = req.params;
    if(!id) {
      return res.status(400).json({success: false, message: "Prospect ID is required"});
    }
    const prospect = await prospectModel.findById(id);
    if(!prospect) {
      return res.status(404).json({success: false, message: "Prospect not found"});
    }
    res.status(200).json({success: true,prospect});
  } catch (error) {
    console.error(error);
    res.status(500).json({success : false, message: "Server error while fetching suspects", error: error.message});

  }
}




// Update a prospect's personal details
exports.updatePersonalDetails = async (req, res) => {
  try {
    const { id} = req.params;

    // 1. Check if the client ID is provided in the URL.
    if (! id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required." });
    }
    
    // 2. Validate that the request body contains the new personalDetails.
    const { personalDetails } = req.body;
    if (!personalDetails || Object.keys(personalDetails).length === 0) {
      return res.status(400).json({ success: false, message: "New personal details are required in the request body." });
    }
    
    // 3. Find the client by ID and update the personalDetails object.
    // The '$set' operator is used here to replace the entire 'personalDetails' object.
    const updatedProspect = await prospectModel.findByIdAndUpdate(
      id,
      { $set: { personalDetails } },
      { new: true, runValidators: true } // Return the updated document and run schema validators.
    );

    // 4. Handle the case where the client ID is not found.
    if (!updatedProspect) {
      return res.status(404).json({ success: false, message: "Prospect not found." });
    }

    // 5. Send a successful response with the updated client document.
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedProspect: updatedProspect
    });

  } catch (error) {
    // 6. Centralized error handling.
    console.error("Error updating personal details:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      details: error.message
    });
  }
};




// Add family members to a prospect
exports.addFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (! id) {
      return res.status(400).json({ success: false, message: "Please provide prospectId" });
    }
    const membersArray = req.body;
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({ success: false, message: "Request body must be a non-empty array of family members" });
    }
    const prospect = await prospectModel.findById(id);
    if (!prospect) {
      return res.status(404).json({ success: false, message: "Prospect not found" });
    }
    prospect.familyMembers.push(...membersArray);
    await prospect.save();
    res.status(201).json({
      success: true,
      message: `${membersArray.length} family member(s) added successfully`,
      familyMembers: prospect.familyMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add family member(s)", error: error.message });
  }
};





// Add financial info to a prospect

exports.addFinancialInfo = async (req, res) => {
  try {
    const { id} = req.params;

    if (! id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }

    // Find the client
    const prospect = await prospectModel.findById(id);
    if (!prospect) {
      return res.status(404).json({ success: false, message: "Prospect not found" });
    }

    // console.log("Request body:", req.body);
    // console.log("Request files:", req.files);

    // Parse JSON strings if they exist, otherwise use empty arrays
    let insuranceData = [];
    let investmentsData = [];
    let loansData = [];

    try {
      // Handle both JSON strings and direct arrays
      if (req.body.insurance) {
        insuranceData = typeof req.body.insurance === 'string'
          ? JSON.parse(req.body.insurance)
          : req.body.insurance;
      }

      if (req.body.investments) {
        investmentsData = typeof req.body.investments === 'string'
          ? JSON.parse(req.body.investments)
          : req.body.investments;
      }

      if (req.body.loans) {
        loansData = typeof req.body.loans === 'string'
          ? JSON.parse(req.body.loans)
          : req.body.loans;
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data format",
        error: parseError.message
      });
    }

    // Ensure arrays are actually arrays
    insuranceData = Array.isArray(insuranceData) ? insuranceData : [];
    investmentsData = Array.isArray(investmentsData) ? investmentsData : [];
    loansData = Array.isArray(loansData) ? loansData : [];

    console.log("Parsed data:", { insuranceData, investmentsData, loansData });

    // Attach document filenames to each item if files exist
    // const attachFiles = (dataArray, uploadedFilesArray = []) => {
    //   if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
    //     dataArray.forEach((item, index) => {
    //       if (uploadedFilesArray[index]) {
    //         item.document = uploadedFilesArray[index].filename;
    //       }
    //     });
    //   }
    // };

    const attachFiles = (dataArray, uploadedFilesArray = []) => {
  if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
    dataArray.forEach((item, index) => {
      if (uploadedFilesArray[index]) {
        item.document = uploadedFilesArray[index].filename;
      } else {
        item.document = null;
      }
    });
  }
};



    // Safely access file arrays
    const insuranceFiles = req.files?.insuranceDocuments || [];
    const investmentFiles = req.files?.investmentDocuments || [];
    const loanFiles = req.files?.loanDocuments || [];

    attachFiles(insuranceData, insuranceFiles);
    attachFiles(investmentsData, investmentFiles);
    attachFiles(loansData, loanFiles);

    // Initialize financialInfo if not present
    if (!suspect.financialInfo) {
      suspect.financialInfo = {
        insurance: [],
        investments: [],
        loans: [],
      };
    }

    // Append new data (only if arrays have content)
    if (insuranceData.length > 0) {
      prospect.financialInfo.insurance.push(...insuranceData);
    }
    if (investmentsData.length > 0) {
      prospect.financialInfo.investments.push(...investmentsData);
    }
    if (loansData.length > 0) {
      prospect.financialInfo.loans.push(...loansData);
    }

    // Check if any data was actually added
    const totalItemsAdded = insuranceData.length + investmentsData.length + loansData.length;
    if (totalItemsAdded === 0) {
      return res.status(400).json({
        success: false,
        message: "No financial data provided",
      });
    }

    // Save client
    await prospect.save();

    return res.status(200).json({
      success: true,
      message: "Financial info with documents added successfully",
      financialInfo: prospect.financialInfo,
      prospectId:prospect._id,
      added: {
        insurance: insuranceData.length,
        investments: investmentsData.length,
        loans: loansData.length
      }
    });

  } catch (error) {
    console.error("Error in addFinancialInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





// Add future priorities and needs to a prospect
exports.addFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const prospectId = req.params.id;
    const { futurePriorities, needs } = req.body;

    // Validate client ID
    if (! prospectId) {
      return res.status(400).json({ error: 'prospect ID is required' });
    }

    // Validate futurePriorities
    if (!Array.isArray(futurePriorities)) {
      return res.status(400).json({ error: 'futurePriorities must be an array' });
    }

    for (const priority of futurePriorities) {
      if (
        !priority.priorityName ||
        !Array.isArray(priority.members) ||
        typeof priority.approxAmount !== 'number' ||
        !priority.duration
      ) {
        return res.status(400).json({ error: 'Invalid priority object structure' });
      }
    }

    // Build update object
    const updateData = {
      futurePriorities
    };

    if (needs && typeof needs === 'object') {
      updateData.needs = needs;
    }

    const updatedProspect = await prospectModel.findByIdAndUpdate(
      prospectId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    res.status(200).json({
      message: 'Future priorities (and needs if provided) updated successfully',
      prospect: updatedProspect,
      prospectId: updatedProspect._id
    });

  } catch (error) {
    console.error('Error updating future priorities and needs:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};





// Add a proposed financial plan to a prospect
exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate client ID
    if (! id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }

    // Validate request body
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    // Handle file uploads
    const files = req.files;
    if (!files) {
      return res.status(401).json({
        success: false,
        message: "Please provide documents to upload"
      });
    }

    const documentPaths = files.map(file => file.filename);

    const prospectToUpdate = await prospectModel.findById(id);
    if (! prospectToUpdate) {
      return res.status(404).json({ success: false, message: "prospect not found" });
    }

    const newProposedPlan = {
      ...req.body,
      documents: documentPaths
    };

    prospectToUpdate.proposedPlan.push(newProposedPlan);

    await prospectToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Proposed financial plan updated successfully",
      proposedPlan: prospectToUpdate.proposedPlan,
      prospectId: prospectToUpdate._id
    });

  } catch (error) {
    console.error('Error adding proposed financial plan:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};





// Update a prospect's status
exports.updateProspectStatus = async (req, res) => {

  try {
    const { status } = req.body;
    if(! status){
      return res.status(400).json({ message: "Status is required" });
    }
    const {id} = req.params;
    if(! id) return res.status(400).json({ message: "Prospect ID is required" });
    const updatedProspect = await prospectModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedProspect) {
      return res.status(404).json({ message: "Prospect not found" });
    }
    res.status(200).json(updatedProspect);
  } catch (error) {
     console.error(error);
     res.status(500).json({ error: error.message });
  }
  
}



// Delete a prospect
exports.deleteProspect = async(req, res)=>{
  try {
    
    const {id} = req.params;
    if(! id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }

    await prospectModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "prospect deleted successfully" });

   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Server error while deleting suspect", error: error.message });   
    }
  }





// get all family members
exports.getAllFamilyMembers = async(req, res)=>{
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Please provide Prospect ID"
        });
      }
  
      const prospect = await prospectModel.findById(id).select("familyMembers");
  
      if (!suspect) {
        return res.status(404).json({
          success: false,
          message: "Prospect not found for this ID"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Family members fetched successfully",
        data: prospect.familyMembers
      });
  
    } catch (error) {
      console.error("Error in fetching all family members:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching family members"
      });
    }
  
}