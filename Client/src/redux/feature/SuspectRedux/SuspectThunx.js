import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

// 1. Create Suspect with Personal Details
export const createSuspect = createAsyncThunk(
  "suspect/createSuspect",
  async (SuspectData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/suspect/create", SuspectData);
      console.log("Suspect created successfully", response?.data?._id);
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
  "suspect/addFuturePrioritiesAndNeeds",
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
  "suspect/addProposedFinancialPlan",
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
          "An error occurred while fetching suspects."
      );
    }
  }
);

// Get all appointment done suspects
export const getAllSuspectsOnlyAppointMentDone = createAsyncThunk(
  "suspect/appointmentDone",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/allappointmentdone`);
      console.log("Get all appointment done suspects", response?.data);
      return response?.data?.suspects;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while fetching appointment done suspects."
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
          "An error occurred while fetching suspect details."
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
          "An error occurred while updating suspect status."
      );
    }
  }
);

// 9. Update Suspect personal Details
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
          "An error occurred while updating the personal details of the suspect."
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
          "An error occurred while deleting a suspect."
      );
    }
  }
);

// 11. GetAll Family Members
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

// 🔄 🔄 🔄 NEW UPDATE FUNCTIONS FOR MODALS 🔄 🔄 🔄

// 12. Update Family Members
export const updateFamilyMembers = createAsyncThunk(
  "suspect/update/familyMembers",
  async ({ id, familyMembers }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/suspect/${id}/family`, {
        familyMembers,
      });
      console.log("Update Family Members successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while updating family members."
      );
    }
  }
);

// 13. Update Financial Information
export const updateFinancialInfo = createAsyncThunk(
  "suspect/update/financialInfo",
  async ({ id, financialInfo }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/suspect/${id}/financial`, {
        financialInfo,
      });
      console.log("Update Financial Info successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while updating financial information."
      );
    }
  }
);

// 14. Update Future Priorities and Needs
export const updateFuturePrioritiesAndNeeds = createAsyncThunk(
  "suspect/update/futurePriorities",
  async ({ id, futurePriorities, needs }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/suspect/${id}/priorities`, {
        futurePriorities,
        needs,
      });
      console.log("Update Future Priorities successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while updating future priorities."
      );
    }
  }
);

// 15. Update Proposed Financial Plan
export const updateProposedFinancialPlan = createAsyncThunk(
  "suspect/update/proposedPlan",
  async ({ id, proposedPlan }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/suspect/${id}/proposed-plan`, {
        proposedPlan,
      });
      console.log("Update Proposed Plan successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while updating proposed financial plan."
      );
    }
  }
);

// 16. Add Call Task for Suspect
export const addCallTask = createAsyncThunk(
  "suspect/addCallTask",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/suspect/${id}/call-task`,
        taskData
      );
      console.log("Add Call Task successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while adding call task."
      );
    }
  }
);

// 17. Get Call History
export const getCallHistory = createAsyncThunk(
  "suspect/getCallHistory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/${id}/call-history`);
      console.log("Get Call History successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while fetching call history."
      );
    }
  }
);

// 18. Get Suspects by Call Status
export const getSuspectsByCallStatus = createAsyncThunk(
  "suspect/getByCallStatus",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/filter/by-call-status`, {
        params,
      });
      console.log("Get Suspects by Call Status successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while fetching suspects by call status."
      );
    }
  }
);

// 19. Get All Appointment Scheduled
export const getAllAppointmentScheduled = createAsyncThunk(
  "suspect/getAllAppointmentScheduled",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/appointments/scheduled`);
      console.log("Get All Appointment Scheduled successfully", response?.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while fetching appointment scheduled."
      );
    }
  }
);

// 20. Get Suspects Appointment Scheduled
export const getSuspectsAppointmentScheduled = createAsyncThunk(
  "suspect/getSuspectsAppointmentScheduled",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/suspect/suspects/appointments`);
      console.log(
        "Get Suspects Appointment Scheduled successfully",
        response?.data
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "An error occurred while fetching suspects appointment scheduled."
      );
    }
  }
);

// 🔄 🔄 🔄 CONSOLIDATED UPDATE FUNCTION 🔄 🔄 🔄

// 21. Update Suspect Data (Generic - for all types)
export const updateSuspectData = createAsyncThunk(
  "suspect/update/data",
  async ({ id, type, data }, { rejectWithValue }) => {
    try {
      let url = "";
      let payload = {};

      switch (type) {
        case "personal":
          url = `/api/suspect/update/personaldetails/${id}`;
          payload = { personalDetails: data };
          break;
        case "family":
          url = `/api/suspect/${id}/family`;
          payload = { familyMembers: data };
          break;
        case "financial":
          url = `/api/suspect/${id}/financial`;
          payload = { financialInfo: data };
          break;
        case "futurePriorities":
          url = `/api/suspect/${id}/priorities`;
          payload = {
            futurePriorities: data.futurePriorities,
            needs: data.needs,
          };
          break;
        case "proposedPlan":
          url = `/api/suspect/${id}/proposed-plan`;
          payload = { proposedPlan: data };
          break;
        default:
          throw new Error("Invalid update type");
      }

      const response = await axios.put(url, payload);
      console.log(`Update ${type} data successfully`, response?.data);
      return { ...response.data, type };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          `An error occurred while updating ${type} data.`
      );
    }
  }
);
