import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

// 1. Create Suspect with Personal Details
export const createSuspect = createAsyncThunk(
  "suspect/createSuspect",
  async (SuspectData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/suspect/create", SuspectData);
      console.log("Suspect client successfully", response?.data?._id);
      return response?.data?._id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while creating the suspect."
      );
    }
  }
);

// 2. Add Family Members
export const addFamilyMember = createAsyncThunk(
  "suspect/addFamilyMember",
  async ({ suspectId, membersArray }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/suspect/add/family/${suspectId}`,
        membersArray
      );
      console.log("Add family members successfully", response?.data?.suspectId);
      return response?.data?.suspectId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding family members."
      );
    }
  }
);

// 3. Add Financial Information
export const addFinancialInfo = createAsyncThunk(
  "suspect/addFinancialInfo",
  async ({ suspectId, financialData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/suspect/add/financialinfo/${suspectId}`,
        financialData
      );
      console.log("Add financial info successfully", response?.data?.suspectId);
      return response?.data?.suspectId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding financial info."
      );
    }
  }
);

// 4. Add Future Priorities and Needs
export const addFuturePrioritiesAndNeeds = createAsyncThunk(
  "prospect/addFuturePrioritiesAndNeeds",
  async ({ suspectId, futurePriorities, needs }, { rejectWithValue }) => {
    try {
      console.log("Received id from future priorities", suspectId);
      const response = await axios.put(
        `/api/suspect/add/futurepriorities/${suspectId}`,
        { futurePriorities, needs }
      );
      console.log(
        "Add future priorities successfully",
        response?.data?.suspectId
      );
      return response?.data?.suspectId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding future priorities and needs."
      );
    }
  }
);

// 5. Add Proposed Financial Plan
export const addProposedFinancialPlan = createAsyncThunk(
  "prospect/addProposedFinancialPlan",
  async ({ suspectId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/suspect/add/proposedplan/${suspectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Add proposed plan successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "An error occurred while adding the proposed financial plan."
      );
    }
  }
);

// 6: Get All Suspects
export const getAllSuspects = createAsyncThunk(
  "suspect/all",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/all`);
      console.log("Get all suspect", response?.data);
      return response?.data?.suspects;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding the proposed financial plan."
      );
    }
  }
);

export const getAllSuspectsOnlyAppointMentDone = createAsyncThunk(
  "suspect/appointmentDone",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/allappointmentdone`);
      console.log("Get all suspect", response?.data);
      return response?.data?.suspects;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding the proposed financial plan."
      );
    }
  }
);

// 7: Get Suspect by Id
export const getSuspectById = createAsyncThunk(
  "suspect/id",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/${id}`);
      console.log("Get single suspect successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding the proposed financial plan."
      );
    }
  }
);

// 8: Update Suspect Status
export const updateSuspectStatus = createAsyncThunk(
  "suspect/update/status",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/suspect/update/status/${id}`, {
        status,
      });
      console.log("Update Suspect Status successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding the proposed financial plan."
      );
    }
  }
);

// 9.update Suspect personal Details
export const updateSuspectPersonalDetails = createAsyncThunk(
  "suspect/update/personal/details",
  async ({ id, personalDetails }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/suspect/update/personaldetails/${id}`,
        { personalDetails }
      );
      console.log(
        "Update Suspect Personal Details successfully",
        response?.data
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occured while updating the personal Details of the suspect."
      );
    }
  }
);

// 10. Delete suspect by id
export const deleteSuspectById = createAsyncThunk(
  "suspect/delete/suspect",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/suspect/delete/${id}`);
      console.log("Delete Suspect successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occured while deleting a suspect."
      );
    }
  }
);

// 11 getAllFamilyMembers
export const getAllFamilyMembers = createAsyncThunk(
  "family/getAllFamilyMembers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/family/details/${id}`);
      console.log("Family members fetched successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "An error occurred while fetching family members."
      );
    }
  }
);
