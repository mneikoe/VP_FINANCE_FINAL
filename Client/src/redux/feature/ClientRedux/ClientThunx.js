import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";


// 1. Create Client with Personal Details
export const createClient = createAsyncThunk(
  'client/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/client/create', clientData);
      console.log("Create client successfully", response?.data?._id)
      return response?.data?._id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while creating the client."
      );
    }
  }
);



export const addFamilyMember = createAsyncThunk(
  'client/addFamilyMember',
  async ({ clientId, membersArray }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/client/add/family/${clientId}`, membersArray);
      console.log("Add family members successfully", response?.data);
      return response?.data; // Return full response (clientId, familyMembers)
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "An error occurred while adding family members."
      );
    }
  }
);

export const updateFamilyMember = createAsyncThunk(
  'client/updateFamilyMember', // Corrected action type
  async ({ clientId, membersArray }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/client/update/family/${clientId}`, membersArray);
      console.log("Update family members successfully", response?.data);
      return response?.data; // Return full response (clientId, familyMembers)
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error 
      );
    }
  }
);


export const addFinancialInfo = createAsyncThunk(
  "client/addFinancialInfo",
  async ({ clientId, financialData, files }, { rejectWithValue }) => {
    console.log("Sending addFinancialInfo request:", { clientId, financialData, files });

    try {
      const formData = new FormData();
      formData.append("insurance", JSON.stringify(financialData.insurance || []));
      formData.append("investments", JSON.stringify(financialData.investments || []));
      formData.append("loans", JSON.stringify(financialData.loans || []));

      if (files?.insuranceDocuments) {
        files.insuranceDocuments.forEach((file) =>
          formData.append("insuranceDocuments", file)
        );
      }
      if (files?.investmentDocuments) {
        files.investmentDocuments.forEach((file) =>
          formData.append("investmentDocuments", file)
        );
      }
      if (files?.loanDocuments) {
        files.loanDocuments.forEach((file) =>
          formData.append("loanDocuments", file)
        );
      }

      const response = await axios.post(
        `/api/client/add/financial/${clientId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Add financial info successfully", response?.data?.clientId);
      return response?.data;
    } catch (error) {
      console.error("addFinancialInfo error:", error?.response?.data || error.message);
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding financial info."
      );
    }
  }
);

export const updateFinancialInfo = createAsyncThunk(
  "client/updateFinancialInfo",
  async ({ clientId, financialData, files }, { rejectWithValue }) => {
    console.log("Sending updateFinancialInfo request:", { clientId, financialData, files });

    try {
      const formData = new FormData();
      formData.append("insurance", JSON.stringify(financialData.insurance || []));
      formData.append("investments", JSON.stringify(financialData.investments || []));
      formData.append("loans", JSON.stringify(financialData.loans || []));

      if (files?.insuranceDocuments) {
        files.insuranceDocuments.forEach((file) =>
          formData.append("insuranceDocuments", file)
        );
      }
      if (files?.investmentDocuments) {
        files.investmentDocuments.forEach((file) =>
          formData.append("investmentDocuments", file)
        );
      }
      if (files?.loanDocuments) {
        files.loanDocuments.forEach((file) =>
          formData.append("loanDocuments", file)
        );
      }

      const response = await axios.put(
        `/api/client/update/financial/${clientId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Update financial info successfully", response?.data?.clientId);
      return response?.data;
    } catch (error) {
      console.error("updateFinancialInfo error:", error?.response?.data || error.message);
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while updating financial info."
      );
    }
  }
);


// 4. Add Future Priorities and Needs
// Add
export const addFuturePrioritiesAndNeeds = createAsyncThunk(
  "client/addFuturePrioritiesAndNeeds",
  async ({ clientId, futurePriorities, needs }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/client/add/future-priorities/${clientId}`,
        { futurePriorities, needs }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding future priorities and needs."
      );
    }
  }
);

// Update
export const updateFuturePrioritiesAndNeeds = createAsyncThunk(
  "client/updateFuturePrioritiesAndNeeds",
  async ({ clientId, futurePriorities, needs }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/client/update/future-priorities/${clientId}`,
        { futurePriorities, needs }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while updating future priorities and needs."
      );
    }
  }
);


export const addProposedFinancialPlan = createAsyncThunk(
  "client/addProposedFinancialPlan",
  async ({ clientId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/client/add/proposed-plan/${clientId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding proposed financial plan."
      );
    }
  }
);

// ✅ Update Proposed Plan
export const updateProposedFinancialPlan = createAsyncThunk(
  "client/updateProposedFinancialPlan",
  async ({ clientId, planId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/client/update/proposed-plan/${clientId}/${planId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while updating proposed financial plan."
      );
    }
  }
);



// 5. Add Proposed Financial Plan
// export const addProposedFinancialPlan = createAsyncThunk(
//   'client/addProposedFinancialPlan',
//   async ({ clientId, formData }, { rejectWithValue }) => {
//     try {
//       const response = await axios.put(`/api/client/add/proposedplan/${clientId}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log("Add proposed plan successfully", response?.data);
//       return response?.data;
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
//       );
//     }
//   }
// );


// update Proposed status
export const updateProposedStatus = createAsyncThunk(
  'client/updateProposedStatus',
  async ({ id, planss }, { rejectWithValue }) => {
    console.log(id,planss);
    
    try {
      const response = await axios.put(`/api/client/add/updateproposedplan/${id}`, planss, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response);
      
      console.log("Add proposed plan successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);


// 6: Get All Clients
export const getAllClients = createAsyncThunk(
  'client/all',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/client/all`);
      console.log("Get all clients", response?.data)
      return response?.data?.clients
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);





// 7: Get Client by Id
export const getClientById = createAsyncThunk(
  'client/id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/client/${id}`);
      console.log("Get single client successfully", response?.data)
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);






// 8: Update Client Status
export const updateCleintStatus = createAsyncThunk(
  'client/update/status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/client/update/status/${id}`, {status});
      console.log("Update Client Status successfully", response?.data)
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);






// 9.update client personal Details
export const updateClientPersonalDetails = createAsyncThunk(
  'client/update/personal/details', 
  async({id, personalDetails}, {rejectWithValue}) => {
    try {
      const response = await axios.put(`/api/client/update/personaldetails/${id}`, {personalDetails});
      console.log("Update Client Personal Details successfully", response?.data)
      return response?.data;
    } catch (error) {
       return rejectWithValue(error?.response?.data?.error || "An error occured while updating the personal Details of the client.")

    }
  }
)


export const updateImage = createAsyncThunk(
  'client/update/image', 
  async({firstId,secondID, image}, {rejectWithValue}) => {
    console.log(firstId)
    console.log(secondID)
    console.log(image)

      const formData = new FormData();
      formData.append("document", image); // 👈 multer.single('document')
      formData.append("secondID", secondID);

    try {
      const response = await axios.put(`/api/client/update/image/${firstId}`, formData,{
        headers:{"Content-Type":"multipart/form-data"}
      });

      console.log("Update Client Personal Details successfully", response?.data)
      return response?.data;
    } catch (error) {
       return rejectWithValue(error?.response?.data?.error || "An error occured while updating the personal Details of the client.")

    }
  }
)


// 10. Delete cleint by id
export const deleteClientById = createAsyncThunk(
  'client/delete/client',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/client/delete/${id}`)
      console.log("Delete Client successfully", response?.data)
      return response?.data;
    } catch (error) {
          return rejectWithValue(error?.response?.data?.error || "An error occured while deleting a client.")
    }
  }
)




// 11 getAllFamilyMembers
export const getAllFamilyMembers = createAsyncThunk(
  "family/getAllFamilyMembers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/client/family/details/${id}`);
      console.log("Family members fetched successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "An error occurred while fetching family members."
      );
    }
  }
);

