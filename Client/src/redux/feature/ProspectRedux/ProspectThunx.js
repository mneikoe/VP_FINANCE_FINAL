import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";


// 1. Create Prospect with Personal Details
export const createProspect = createAsyncThunk(
  'client/createProspect',
  async (ProspectData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/prospect/create', ProspectData);
      console.log("Prospect client successfully", response?.data?._id)
      return response?.data?._id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while creating the client."
      );
    }
  }
);





// 2. Add Family Members
export const addFamilyMember = createAsyncThunk(
  'prospect/addFamilyMember',
  async ({ prospectId, membersArray }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/prospect/add/family/${prospectId}`, membersArray);
      console.log("Add family members successfully", response?.data?.prospectId)
      return response?.data?.prospectId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding family members."
      );
    }
  }
);




// 3. Add Financial Information
export const addFinancialInfo = createAsyncThunk(
  'prospect/addFinancialInfo',
  async ({ prospectId, financialData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/client/add/financialinfo/${prospectId}`, financialData);
      console.log("Add financial info successfully", response?.data?.prospectId)
      return response?.data?.prospectId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding financial info."
      );
    }
  }
);


// 4. Add Future Priorities and Needs
export const addFuturePrioritiesAndNeeds = createAsyncThunk(
  'prospect/addFuturePrioritiesAndNeeds',
  async ({ prospectId, futurePriorities, needs }, { rejectWithValue }) => {
    try {
      console.log("Received id from future priorities", prospectId)
      const response = await axios.put(`/api/prospect/add/futurepriorities/${prospectId}`, { futurePriorities, needs });
      console.log("Add future priorities successfully", response?.data?.prospectId)
      return response?.data?.prospectId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding future priorities and needs."
      );
    }
  }
);




// 5. Add Proposed Financial Plan
export const addProposedFinancialPlan = createAsyncThunk(
  'prospect/addProposedFinancialPlan',
  async ({ prospectId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/prospect/add/proposedplan/${prospectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Add proposed plan successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);



// 6: Get All Prospects
export const getAllProspects = createAsyncThunk(
  'prospect/all',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/prospect/all`);
      console.log("Get all prospects", response?.data)
      return response?.data?.prospects
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);





// 7: Get Prospect by Id
export const getProspectById = createAsyncThunk(
  'prospect/id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/prospect/${id}`);
      console.log("Get single prospect successfully", response?.data)
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);






// 8: Update Prospect Status
export const updateProspectStatus = createAsyncThunk(
  'prospect/update/status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/prospect/update/status/${id}`, {status});
      console.log("Update Prospect Status successfully", response?.data)
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "An error occurred while adding the proposed financial plan."
      );
    }
  }
);






// 9.update Prospect personal Details
export const updateProspectPersonalDetails = createAsyncThunk(
  'prospect/update/personal/details', 
  async({id, personalDetails}, {rejectWithValue}) => {
    try {
      const response = await axios.put(`/api/prospect/update/personaldetails/${id}`, {personalDetails});
      console.log("Update Prospect Personal Details successfully", response?.data)
      return response?.data;
    } catch (error) {
       return rejectWithValue(error?.response?.data?.error || "An error occured while updating the personal Details of the client.")

    }
  }
)



// 10. Delete prospect by id
export const deleteProspectById = createAsyncThunk(
  'prospect/delete/prospect',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/prospect/delete/${id}`)
      console.log("Delete Prospect successfully", response?.data)
      return response?.data;
    } catch (error) {
          return rejectWithValue(error?.response?.data?.error || "An error occured while deleting a prospect.")
    }
  }
)




// 11 getAllFamilyMembers
export const getAllFamilyMembers = createAsyncThunk(
  "family/getAllFamilyMembers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/prospect/family/details/${id}`);
      console.log("Family members fetched successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "An error occurred while fetching family members."
      );
    }
  }
);




