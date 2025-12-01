const clientModel = require("../Models/SusProsClientSchema");
const generateAndStoreGroupCode = require("../utils/generateGroupCode");
const Kyc = require("../Models/kyc");

// create Client
exports.createClient = async (req, res) => {
  try {
    // Check if request body has data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(401).json({
        error: "No client data provided in request body",
      });
    }

    const clientData = { ...req.body, status: "client" };
    const newClient = new clientModel(clientData);
    const savedClient = await newClient.save();

    if (!savedClient || !savedClient._id) {
      return res.status(500).json({
        error: "Failed to save client data properly",
      });
    }

    const groupCode = await generateAndStoreGroupCode(
      savedClient._id.toString()
    );
    if (!savedClient.personalDetails) {
      savedClient.personalDetails = {};
    }
    savedClient.personalDetails.groupCode = groupCode;
    await savedClient.save();

    res.status(201).json(savedClient);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create client first form",
      details: err.message,
    });
  }
};

// add family members

exports.addFamilyMember = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide clientId" });
    }

    const membersArray = req.body;
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of family members",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Add new members
    membersArray.forEach((member) => {
      const {
        title,
        name,
        relation,
        annualIncome,
        contact,
        occupation,
        dobActual,
        dobRecord,
        marriageDate,
        includeHealth,
        healthHistory,
      } = member;

      client.familyMembers.push({
        title: title || "",
        name: name || "",
        relation: relation || "",
        annualIncome: annualIncome || "",
        contact: contact || "",
        occupation: occupation || "",
        dobActual: dobActual || "",
        dobRecord: dobRecord || "",
        marriageDate: marriageDate || "",
        includeHealth: includeHealth || false,
        healthHistory: includeHealth ? healthHistory : undefined,
      });
    });

    await client.save();

    res.status(200).json({
      success: true,
      message: "Family member(s) added successfully",
      familyMembers: client.familyMembers,
      clientId: client._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add family member(s)",
      error: error.message,
    });
  }
} 

exports.updateFamilyMember = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide clientId" });
    }

    const membersArray = req.body;
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of family members",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Get IDs from incoming membersArray
    const incomingMemberIds = membersArray
      .filter((member) => member._id)
      .map((member) => member._id.toString());

    // Remove members not present in membersArray
    client.familyMembers = client.familyMembers.filter((member) =>
      incomingMemberIds.includes(member._id.toString())
    );

    // Process each member in membersArray (update or add)
    membersArray.forEach((member) => {
      const {
        _id,
        title,
        name,
        relation,
        annualIncome,
        contact,
        occupation,
        dobActual,
        dobRecord,
        marriageDate,
        includeHealth,
        healthHistory,
      } = member;

      if (_id) {
        // Update existing member
        const existingMember = client.familyMembers.id(_id);
        if (existingMember) {
          existingMember.title = title || "";
          existingMember.name = name || "";
          existingMember.relation = relation || "";
          existingMember.annualIncome = annualIncome || "";
          existingMember.contact = contact || "";
          existingMember.occupation = occupation || "";
          existingMember.dobActual = dobActual || "";
          existingMember.dobRecord = dobRecord || "";
          existingMember.marriageDate = marriageDate || "";
          existingMember.includeHealth = includeHealth || false;
          if (includeHealth && healthHistory) {
            existingMember.healthHistory = healthHistory;
          } else {
            existingMember.healthHistory = undefined;
          }
        } else {
          // If _id is provided but not found, treat as new member
          client.familyMembers.push({
            title: title || "",
            name: name || "",
            relation: relation || "",
            annualIncome: annualIncome || "",
            contact: contact || "",
            occupation: occupation || "",
            dobActual: dobActual || "",
            dobRecord: dobRecord || "",
            marriageDate: marriageDate || "",
            includeHealth: includeHealth || false,
            healthHistory: includeHealth ? healthHistory : undefined,
          });
        }
      } else {
        // Add new member
        client.familyMembers.push({
          title: title || "",
          name: name || "",
          relation: relation || "",
          annualIncome: annualIncome || "",
          contact: contact || "",
          occupation: occupation || "",
          dobActual: dobActual || "",
          dobRecord: dobRecord || "",
          marriageDate: marriageDate || "",
          includeHealth: includeHealth || false,
          healthHistory: includeHealth ? healthHistory : undefined,
        });
      }
    });

    await client.save();

    res.status(200).json({
      success: true,
      message: "Family member(s) updated successfully",
      familyMembers: client.familyMembers,
      clientId: client._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update family member(s)",
      error: error.message,
    });
  }
};




// add financial details of the client
exports.addFinancialInfo = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    // Find the client
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Parse JSON strings if they exist, otherwise use empty arrays
    let insuranceData = [];
    let investmentsData = [];
    let loansData = [];

    try {
      if (req.body.insurance) {
        insuranceData =
          typeof req.body.insurance === "string"
            ? JSON.parse(req.body.insurance)
            : req.body.insurance;
      }
      if (req.body.investments) {
        investmentsData =
          typeof req.body.investments === "string"
            ? JSON.parse(req.body.investments)
            : req.body.investments;
      }
      if (req.body.loans) {
        loansData =
          typeof req.body.loans === "string"
            ? JSON.parse(req.body.loans)
            : req.body.loans;
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data format",
        error: parseError.message,
      });
    }

    // Ensure arrays are actually arrays
    insuranceData = Array.isArray(insuranceData) ? insuranceData : [];
    investmentsData = Array.isArray(investmentsData) ? investmentsData : [];
    loansData = Array.isArray(loansData) ? loansData : [];

    // Set default submissionDate if not provided
    const setDefaultSubmissionDate = (item) => {
      if (!item.submissionDate || item.submissionDate.trim() === "") {
        return {
          ...item,
          submissionDate: new Date().toISOString().split("T")[0], // format YYYY-MM-DD
        };
      }
      return item;
    };

    insuranceData = insuranceData.map(setDefaultSubmissionDate);
    investmentsData = investmentsData.map(setDefaultSubmissionDate);
    loansData = loansData.map(setDefaultSubmissionDate);

    console.log("Parsed data:", { insuranceData, investmentsData, loansData });

    // Attach document filenames to each item if files exist
    const attachFiles = (dataArray, uploadedFilesArray = []) => {
      if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
        dataArray.forEach((item, index) => {
          item.document = uploadedFilesArray[index] ? uploadedFilesArray[index].filename : null;
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

    // Replace existing financialInfo with new data
    client.financialInfo = {
      insurance: insuranceData,
      investments: investmentsData,
      loans: loansData,
    };

    // Save client
    await client.save();

    return res.status(200).json({
      success: true,
      message: "Financial info added successfully",
      financialInfo: client.financialInfo,
      clientId: client._id,
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

//update financial details of the client
exports.updateFinancialInfo = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    // Find the client
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Parse JSON strings if they exist, otherwise use empty arrays
    let insuranceData = [];
    let investmentsData = [];
    let loansData = [];

    try {
      if (req.body.insurance) {
        insuranceData =
          typeof req.body.insurance === "string"
            ? JSON.parse(req.body.insurance)
            : req.body.insurance;
      }
      if (req.body.investments) {
        investmentsData =
          typeof req.body.investments === "string"
            ? JSON.parse(req.body.investments)
            : req.body.investments;
      }
      if (req.body.loans) {
        loansData =
          typeof req.body.loans === "string"
            ? JSON.parse(req.body.loans)
            : req.body.loans;
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data format",
        error: parseError.message,
      });
    }

    // Ensure arrays are actually arrays
    insuranceData = Array.isArray(insuranceData) ? insuranceData : [];
    investmentsData = Array.isArray(investmentsData) ? investmentsData : [];
    loansData = Array.isArray(loansData) ? loansData : [];

    // Set default submissionDate if not provided
    const setDefaultSubmissionDate = (item) => {
      if (!item.submissionDate || item.submissionDate.trim() === "") {
        return {
          ...item,
          submissionDate: new Date().toISOString().split("T")[0], // format YYYY-MM-DD
        };
      }
      return item;
    };

    insuranceData = insuranceData.map(setDefaultSubmissionDate);
    investmentsData = investmentsData.map(setDefaultSubmissionDate);
    loansData = loansData.map(setDefaultSubmissionDate);

    console.log("Parsed data:", { insuranceData, investmentsData, loansData });

    // Attach document filenames to each item if files exist
    const attachFiles = (dataArray, uploadedFilesArray = []) => {
      if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
        dataArray.forEach((item, index) => {
          item.document = uploadedFilesArray[index] ? uploadedFilesArray[index].filename : null;
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
    if (!client.financialInfo) {
      client.financialInfo = {
        insurance: [],
        investments: [],
        loans: [],
      };
    }

    // Process insurance: update existing items, add new ones, remove others
    const insuranceIds = insuranceData
      .filter((item) => item._id)
      .map((item) => item._id.toString());
    client.financialInfo.insurance = client.financialInfo.insurance.filter((item) =>
      insuranceIds.includes(item._id.toString())
    );

    insuranceData.forEach((item) => {
      const { _id, ...data } = item;
      if (_id) {
        const existingItem = client.financialInfo.insurance.id(_id);
        if (existingItem) {
          Object.assign(existingItem, {
            ...data,
            document: item.document || existingItem.document || null,
          });
        } else {
          client.financialInfo.insurance.push({ ...data, document: item.document || null });
        }
      } else {
        client.financialInfo.insurance.push({ ...data, document: item.document || null });
      }
    });

    // Process investments: update existing items, add new ones, remove others
    const investmentIds = investmentsData
      .filter((item) => item._id)
      .map((item) => item._id.toString());
    client.financialInfo.investments = client.financialInfo.investments.filter((item) =>
      investmentIds.includes(item._id.toString())
    );

    investmentsData.forEach((item) => {
      const { _id, ...data } = item;
      if (_id) {
        const existingItem = client.financialInfo.investments.id(_id);
        if (existingItem) {
          Object.assign(existingItem, {
            ...data,
            document: item.document || existingItem.document || null,
          });
        } else {
          client.financialInfo.investments.push({ ...data, document: item.document || null });
        }
      } else {
        client.financialInfo.investments.push({ ...data, document: item.document || null });
      }
    });

    // Process loans: update existing items, add new ones, remove others
    const loanIds = loansData
      .filter((item) => item._id)
      .map((item) => item._id.toString());
    client.financialInfo.loans = client.financialInfo.loans.filter((item) =>
      loanIds.includes(item._id.toString())
    );

    loansData.forEach((item) => {
      const { _id, ...data } = item;
      if (_id) {
        const existingItem = client.financialInfo.loans.id(_id);
        if (existingItem) {
          Object.assign(existingItem, {
            ...data,
            document: item.document || existingItem.document || null,
          });
        } else {
          client.financialInfo.loans.push({ ...data, document: item.document || null });
        }
      } else {
        client.financialInfo.loans.push({ ...data, document: item.document || null });
      }
    });

    // Save client
    await client.save();

    return res.status(200).json({
      success: true,
      message: "Financial info updated successfully",
      financialInfo: client.financialInfo,
      clientId: client._id,
    });
  } catch (error) {
    console.error("Error in updateFinancialInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};







// Existing updateFamilyMember controller (unchanged, included for completeness)
exports.updateFamilyMember = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide clientId" });
    }

    const membersArray = req.body;
    if (!Array.isArray(membersArray)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of family members",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Get IDs from incoming membersArray
    const incomingMemberIds = membersArray
      .filter((member) => member._id)
      .map((member) => member._id.toString());

    // Remove members not present in membersArray
    client.familyMembers = client.familyMembers.filter((member) =>
      incomingMemberIds.includes(member._id.toString())
    );

    // Process each member in membersArray (update or add)
    membersArray.forEach((member) => {
      const {
        _id,
        title,
        name,
        relation,
        annualIncome,
        contact,
        occupation,
        dobActual,
        dobRecord,
        marriageDate,
        includeHealth,
        healthHistory,
      } = member;

      if (_id) {
        // Update existing member
        const existingMember = client.familyMembers.id(_id);
        if (existingMember) {
          existingMember.title = title || "";
          existingMember.name = name || "";
          existingMember.relation = relation || "";
          existingMember.annualIncome = annualIncome || "";
          existingMember.contact = contact || "";
          existingMember.occupation = occupation || "";
          existingMember.dobActual = dobActual || "";
          existingMember.dobRecord = dobRecord || "";
          existingMember.marriageDate = marriageDate || "";
          existingMember.includeHealth = includeHealth || false;
          existingMember.healthHistory = includeHealth && healthHistory ? healthHistory : undefined;
        } else {
          // If _id is provided but not found, treat as new member
          client.familyMembers.push({
            title: title || "",
            name: name || "",
            relation: relation || "",
            annualIncome: annualIncome || "",
            contact: contact || "",
            occupation: occupation || "",
            dobActual: dobActual || "",
            dobRecord: dobRecord || "",
            marriageDate: marriageDate || "",
            includeHealth: includeHealth || false,
            healthHistory: includeHealth ? healthHistory : undefined,
          });
        }
      } else {
        // Add new member
        client.familyMembers.push({
          title: title || "",
          name: name || "",
          relation: relation || "",
          annualIncome: annualIncome || "",
          contact: contact || "",
          occupation: occupation || "",
          dobActual: dobActual || "",
          dobRecord: dobRecord || "",
          marriageDate: marriageDate || "",
          includeHealth: includeHealth || false,
          healthHistory: includeHealth ? healthHistory : undefined,
        });
      }
    });

    await client.save();

    res.status(200).json({
      success: true,
      message: "Family member(s) updated successfully",
      familyMembers: client.familyMembers,
      clientId: client._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update family member(s)",
      error: error.message,
    });
  }
};

// Existing addFamilyMember controller (unchanged, included for reference)
exports.addFamilyMember = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide clientId" });
    }

    const membersArray = req.body;
    if (!Array.isArray(membersArray)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of family members",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Clear existing family members and replace with new ones
    client.familyMembers = [];
    membersArray.forEach((member) => {
      const {
        title,
        name,
        relation,
        annualIncome,
        contact,
        occupation,
        dobActual,
        dobRecord,
        marriageDate,
        includeHealth,
        healthHistory,
      } = member;

      client.familyMembers.push({
        title: title || "",
        name: name || "",
        relation: relation || "",
        annualIncome: annualIncome || "",
        contact: contact || "",
        occupation: occupation || "",
        dobActual: dobActual || "",
        dobRecord: dobRecord || "",
        marriageDate: marriageDate || "",
        includeHealth: includeHealth || false,
        healthHistory: includeHealth ? healthHistory : undefined,
      });
    });

    await client.save();

    res.status(200).json({
      success: true,
      message: "Family member(s) added successfully",
      familyMembers: client.familyMembers,
      clientId: client._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add family member(s)",
      error: error.message,
    });
  }
};


//   try {
//     const { clientId } = req.params;

//     if (!clientId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Client ID is required" });
//     }

//     // Find the client
//     const client = await clientModel.findById(clientId);
//     if (!client) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Client not found" });
//     }

//     // console.log("Request body:", req.body);
//     // console.log("Request files:", req.files);

//     // Parse JSON strings if they exist, otherwise use empty arrays
//     let insuranceData = [];
//     let investmentsData = [];
//     let loansData = [];

//     console.log(req.body.insurance);
//     console.log(req.body.investments);
//     console.log(req.body.loans);

//     const insurance = req?.body?.insurance?.map((item) => {
//       if (!item.submissionDate || item.submissionDate.trim() === "") {
//         return {
//           ...item,
//           submissionDate: new Date().toISOString().split("T")[0], // format YYYY-MM-DD
//         };
//       }
//       return item;
//     });

//     const investments = req?.body?.investments?.map((item) => {
//       if (!item.submissionDate || item.submissionDate.trim() === "") {
//         return {
//           ...item,
//           submissionDate: new Date().toISOString().split("T")[0], // format YYYY-MM-DD
//         };
//       }
//       return item;
//     });

//     const loans = req?.body?.loans?.map((item) => {
//       if (!item.submissionDate || item.submissionDate.trim() === "") {
//         return {
//           ...item,
//           submissionDate: new Date().toISOString().split("T")[0], // format YYYY-MM-DD
//         };
//       }
//       return item;
//     });

//     try {
//       // Handle both JSON strings and direct arrays
//       if (req.body.insurance) {
//         // typeof req.body.insurance === "string"
//         //   ? JSON.parse(req.body.insurance)
//         //   : req.body.insurance;
//         insuranceData =
//           typeof req.body.insurance === "string"
//             ? JSON.parse(insurance)
//             : insurance;
//       }

//       if (req.body.investments) {
//         investmentsData =
//           typeof req.body.investments === "string"
//             ? JSON.parse(investments)
//             : investments;
//       }

//       if (req.body.loans) {
//         loansData =
//           typeof req.body.loans === "string"
//             ? JSON.parse(loans)
//             : loans;
//       }
//     } catch (parseError) {
//       console.error("JSON parsing error:", parseError);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid JSON data format",
//         error: parseError.message,
//       });
//     }

//     // Ensure arrays are actually arrays
//     insuranceData = Array.isArray(insuranceData) ? insuranceData : [];
//     investmentsData = Array.isArray(investmentsData) ? investmentsData : [];
//     loansData = Array.isArray(loansData) ? loansData : [];

//     console.log("Parsed data:", { insuranceData, investmentsData, loansData });

//     // Attach document filenames to each item if files exist
//     // const attachFiles = (dataArray, uploadedFilesArray = []) => {
//     //   if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
//     //     dataArray.forEach((item, index) => {
//     //       if (uploadedFilesArray[index]) {
//     //         item.document = uploadedFilesArray[index].filename;
//     //       }
//     //     });
//     //   }
//     // };

//     const attachFiles = (dataArray, uploadedFilesArray = []) => {
//       if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
//         dataArray.forEach((item, index) => {
//           if (uploadedFilesArray[index]) {
//             item.document = uploadedFilesArray[index].filename;
//           } else {
//             item.document = null;
//           }
//         });
//       }
//     };

//     // Safely access file arrays
//     const insuranceFiles = req.files?.insuranceDocuments || [];
//     const investmentFiles = req.files?.investmentDocuments || [];
//     const loanFiles = req.files?.loanDocuments || [];

//     attachFiles(insuranceData, insuranceFiles);
//     attachFiles(investmentsData, investmentFiles);
//     attachFiles(loansData, loanFiles);

//     // Initialize financialInfo if not present
//     if (!client.financialInfo) {
//       client.financialInfo = {
//         insurance: [],
//         investments: [],
//         loans: [],
//       };
//     }

//     // Append new data (only if arrays have content)
//     if (insuranceData.length > 0) {
//       client.financialInfo.insurance.push(...insuranceData);
//     }
//     if (investmentsData.length > 0) {
//       client.financialInfo.investments.push(...investmentsData);
//     }
//     if (loansData.length > 0) {
//       client.financialInfo.loans.push(...loansData);
//     }

//     // Check if any data was actually added
//     const totalItemsAdded =
//       insuranceData.length + investmentsData.length + loansData.length;
//     if (totalItemsAdded === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No financial data provided",
//       });
//     }

//     // Save client
//     await client.save();

//     return res.status(200).json({
//       success: true,
//       message: "Financial info with documents added successfully",
//       financialInfo: client.financialInfo,
//       clientId: client._id,
//       added: {
//         insurance: insuranceData.length,
//         investments: investmentsData.length,
//         loans: loansData.length,
//       },
//     });
//   } catch (error) {
//     console.error("Error in addFinancialInfo:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// add future priorities and needs
// ✅ Add Future Priorities & Needs
exports.addFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide clientId" });
    }

    const { futurePriorities, needs } = req.body;

    if (!Array.isArray(futurePriorities) || futurePriorities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "futurePriorities must be a non-empty array",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Push new priorities
    futurePriorities.forEach((priority) => {
      const { priorityName, members, approxAmount, duration } = priority;

      client.futurePriorities.push({
        priorityName: priorityName || "",
        members: Array.isArray(members) ? members : [],
        approxAmount: typeof approxAmount === "number" ? approxAmount : 0,
        duration: duration || "",
      });
    });

    // Add needs if provided
    if (needs && typeof needs === "object") {
      client.needs = needs;
    }

    await client.save();

    res.status(200).json({
      success: true,
      message: "Future priorities (and needs if provided) added successfully",
      futurePriorities: client.futurePriorities,
      needs: client.needs,
      clientId: client._id,
    });
  } catch (error) {
    console.error("Error adding future priorities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add future priorities",
      error: error.message,
    });
  }
};

// ✅ Update Future Priorities & Needs
exports.updateFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide clientId" });
    }

    const { futurePriorities, needs } = req.body;

    if (!Array.isArray(futurePriorities) || futurePriorities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "futurePriorities must be a non-empty array",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Get IDs from incoming priorities
    const incomingPriorityIds = futurePriorities
      .filter((p) => p._id)
      .map((p) => p._id.toString());

    // Remove priorities not present anymore
    client.futurePriorities = client.futurePriorities.filter((p) =>
      incomingPriorityIds.includes(p._id.toString())
    );

    // Update or add priorities
    futurePriorities.forEach((priority) => {
      const { _id, priorityName, members, approxAmount, duration } = priority;

      if (_id) {
        // Update existing
        const existing = client.futurePriorities.id(_id);
        if (existing) {
          existing.priorityName = priorityName || "";
          existing.members = Array.isArray(members) ? members : [];
          existing.approxAmount =
            typeof approxAmount === "number" ? approxAmount : 0;
          existing.duration = duration || "";
        } else {
          // If ID not found, push new
          client.futurePriorities.push({
            priorityName: priorityName || "",
            members: Array.isArray(members) ? members : [],
            approxAmount: typeof approxAmount === "number" ? approxAmount : 0,
            duration: duration || "",
          });
        }
      } else {
        // Add new
        client.futurePriorities.push({
          priorityName: priorityName || "",
          members: Array.isArray(members) ? members : [],
          approxAmount: typeof approxAmount === "number" ? approxAmount : 0,
          duration: duration || "",
        });
      }
    });

    // Update needs if provided
    if (needs && typeof needs === "object") {
      client.needs = needs;
    }

    await client.save();

    res.status(200).json({
      success: true,
      message: "Future priorities (and needs if provided) updated successfully",
      futurePriorities: client.futurePriorities,
      needs: client.needs,
      clientId: client._id,
    });
  } catch (error) {
    console.error("Error updating future priorities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update future priorities",
      error: error.message,
    });
  }
};



// ✅ Add Proposed Financial Plan
exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const clientToUpdate = await clientModel.findById(clientId);
    if (!clientToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Handle file uploads (optional)
    let documentPaths = [];
    if (req.files && req.files.length > 0) {
      documentPaths = req.files.map((file) => file.filename);
    }

    const newProposedPlan = {
      ...req.body,
      createdDate:
        !req.body.createdDate || req.body.createdDate.trim() === ""
          ? new Date().toISOString().split("T")[0] // YYYY-MM-DD format
          : req.body.createdDate,
      documents: documentPaths,
    };

    clientToUpdate.proposedPlan.push(newProposedPlan);
    await clientToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Proposed financial plan added successfully",
      proposedPlan: clientToUpdate.proposedPlan,
      clientId: clientToUpdate._id,
    });
  } catch (error) {
    console.error("Error adding proposed financial plan:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// ✅ Update Proposed Financial Plan
exports.updateProposedFinancialPlan = async (req, res) => {
  try {
    const { clientId, planId } = req.params;

    if (!clientId || !planId) {
      return res.status(400).json({
        success: false,
        message: "Client ID and Plan ID are required",
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const planIndex = client.proposedPlan.findIndex(
      (plan) => plan._id.toString() === planId
    );

    if (planIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Proposed plan not found" });
    }

    // Handle file uploads (optional)
    let documentPaths = client.proposedPlan[planIndex].documents || [];
    if (req.files && req.files.length > 0) {
      documentPaths = [
        ...documentPaths,
        ...req.files.map((file) => file.filename),
      ];
    }

    // Update plan fields
    client.proposedPlan[planIndex] = {
      ...client.proposedPlan[planIndex]._doc,
      ...req.body,
      documents: documentPaths,
      updatedDate: new Date().toISOString().split("T")[0], // track update date
    };

    await client.save();

    res.status(200).json({
      success: true,
      message: "Proposed financial plan updated successfully",
      proposedPlan: client.proposedPlan,
      clientId: client._id,
    });
  } catch (error) {
    console.error("Error updating proposed financial plan:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};



exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate client ID
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    // Validate request body
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Request body is required" });
    }

    // Handle file uploads
    const files = req.files;
    if (!files) {
      return res.status(401).json({
        success: false,
        message: "Please provide documents to upload",
      });
    }

    const documentPaths = files.map((file) => file.filename);

    const clientToUpdate = await clientModel.findById(clientId);
    if (!clientToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Create new proposed plan object
    const newProposedPlan = {
      ...req.body,
      createdDate:
        !req.body.createdDate || req.body.createdDate.trim() === ""
          ? new Date().toISOString().split("T")[0] // YYYY-MM-DD format
          : req.body.createdDate,
      documents: documentPaths,
    };

    clientToUpdate.proposedPlan.push(newProposedPlan);

    await clientToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Proposed financial plan updated successfully",
      proposedPlan: clientToUpdate.proposedPlan,
      clientId: clientToUpdate._id,
    });
  } catch (error) {
    console.error("Error adding proposed financial plan:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};


//update porposed status
exports.updatePorposedStatus = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status, selected } = req.body;
    console.log(status, selected,'ttttttttttttttt');

    if (!status || !selected) {
      return res.status(403).json({ message: "all fields are required" });
    }

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Request body is required" });
    }

    const result = await clientModel.updateOne(
      { _id: clientId, "proposedPlan._id": selected }, // match client and plan
      { $set: { "proposedPlan.$.status": status } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Plan not found or no changes made" });
    }

    res.status(200).json({
      success: true,
      message: "Proposed financial plan updated successfully",
      clientId,
    });
  } catch (error) {
    console.error("Error adding proposed financial plan:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};



exports.updatePersonalDetails = async (req, res) => {
  try {
    const { clientId } = req.params;

    // 1. Check if the client ID is provided in the URL.
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required." });
    }

    // 2. Validate that the request body contains the new personalDetails.
    const { personalDetails } = req.body;
    if (!personalDetails || Object.keys(personalDetails).length === 0) {
      return res.status(400).json({
        success: false,
        message: "New personal details are required in the request body.",
      });
    }

  
    const updatedClient = await clientModel.findByIdAndUpdate(
      clientId,
      { $set: { personalDetails } },
      { new: true, runValidators: true } 
    );

  
    if (!updatedClient) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found." });
    }


    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedClient: updatedClient,
    });
  } catch (error) {
    // 6. Centralized error handling.
    console.error("Error updating personal details:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      details: error.message,
    });
  }
};


exports.updateImage = async (req, res) => {
  try {
    const { firstId } = req.params;
    const { secondID } = req.body;  // yahan se bhejna hoga frontend se

    console.log(req.body)

    console.log(firstId)
    console.log(secondID)


    console.log("req.body:", req.body);
    console.log("req.params:", req.params);
    console.log("req.file:", req.file); //

    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }


    // 1. Check if the client ID is provided in the URL.
    if (!firstId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required." });
    }
    // 2. Validate that the request body contains the new personalDetails.
    // const imageFilename = req.file.filename;
    const imagePath = `/Images/${req.file.filename}`;
    // console.log(Image)

    // const imagePath = `/Images/${imageFilename}`;

    // if (!image) {
    //   console.log("image required");

    // }

    // const result = await clientModel.updateOne(
    //   { _id: firstId },
    //   { $set: { "personalDetails.profilepic": imagePath } }
    // );

    // if (result.modifiedCount === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Plan not found or no changes made" });
    // }

    // 4. Handle the case where the client ID is not found.
    const updatedClient = await clientModel.findByIdAndUpdate(
      firstId,
      { $set: { "personalDetails.profilepic": imagePath } },
      { new: true }
    );


    if (!updatedClient) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found." });
    }

    // 5. Send a successful response with the updated client document.
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedClient: updatedClient,
    });
  } catch (error) {
    // 6. Centralized error handling.
    console.error("Error updating personal details:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      details: error.message,
    });
  }
};

// Get all CLients
exports.getAllClients = async (req, res) => {
  try {
    const allClients = await clientModel.find({ status: "client" });
    if (allClients.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No clients found" });
    res.status(200).json({ success: true, clients: allClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching clients",
      error: error.message,
    });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }
    const client = await clientModel.findById(id);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }
    res.status(200).json({ success: true, client });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching clients",
      error: error.message,
    });
  }
};

// update Client Status
exports.updateClientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Client ID is required" });
    const updatedClient = await clientModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    await clientModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting client",
      error: error.message,
    });
  }
};

// Get All Family Members
exports.getAllFamilyMembers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide Client ID",
      });
    }

    const client = await clientModel.findById(id).select("familyMembers");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found for this ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Family members fetched successfully",
      data: client.familyMembers,
    });
  } catch (error) {
    console.error("Error in fetching all family members:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching family members",
    });
  }
};

// CREATE a new KYC
exports.createKyc = async (req, res) => {
  try {


    const { clientId } = req.params;
    const { memberName, documentName, documentNumber, remark } = req.body;

    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }



    // Check if file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a document" });
    }

    // Find client
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Save file name
    // const fileUrl = req.file.filename;

    const fileUrl = `${req.protocol}://${req.get("host")}/Images/${req.file.filename
      }`;

    // console.log(fileUrl, "fileUrl in createKyc");

    // Create KYC
    const kyc = new Kyc({
      memberName,
      documentName,
      documentNumber,
      remark,
      fileUrl,
      user: clientId,
    });

    await kyc.save();

    // Link KYC to client
    client.kycs.push(kyc._id);
    await client.save();

    // Determine remaining vs completed documents
    const uploadedKycs = await Kyc.find({ user: clientId }).select(
      "documentName"
    );

    const uploadedDocs = uploadedKycs.map((k) => k.documentName);



    return res.status(201).json({
      success: true,
      message: "KYC uploaded successfully",
      uploaded: kyc,

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET all KYC documents for a specific member
exports.getKycsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const kycs = await Kyc.find({ user: clientId });
    if (kycs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Kycs found for this Cleint.",
      });
    }

    return res.status(200).json({ success: true, kycs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a KYC document
exports.deleteKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await Kyc.findByIdAndDelete(id);
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // Optionally remove it from client's kycs array
    await clientModel.updateOne({ kycs: id }, { $pull: { kycs: id } });

    return res
      .status(200)
      .json({ success: true, message: "KYC deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE a KYC document
exports.updateKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberName, documentName, documentNumber, remark } = req.body;

    // Validate if documentName is one of the allowed enum values
    const allowedDocumentNames = [
      "Registration form",
      "Rough data sheet",
      "School certificate",
      "Aadhar Card",
      "Pan Card",
      "Photo",
      "Driving License",
      "Voter Id",
      "Policy Status",
    ];

    if (documentName && !allowedDocumentNames.includes(documentName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid documentName. Allowed values are: ${allowedDocumentNames.join(
          ", "
        )}`,
      });
    }

    // Prepare update object
    const updateData = {
      memberName,
      documentName,
      documentNumber,
      remark,
    };

    // Handle optional file upload
    if (req.file) {
      // updateData.fileUrl = req.file.filename;
      const fileUrl = `${req.protocol}://${req.get("host")}/Images/${req.file.filename
        }`;
      updateData.fileUrl = fileUrl;
    }

    // Remove undefined fields (to avoid overwriting with undefined)
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updated = await Kyc.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    return res.status(200).json({
      success: true,
      message: "KYC updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Update KYC error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};