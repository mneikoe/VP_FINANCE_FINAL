import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/suspect";

// Fetch all leads
export const fetchSuspectLeads = createAsyncThunk(
  "suspectLead/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}?status=suspect`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single lead by ID
export const fetchSuspectLeadById = createAsyncThunk(
  "suspectLead/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      console.log("✅ API RESPONSE for fetchById:", response.data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new lead
export const createSuspectLead = createAsyncThunk(
  "suspectLead/create",
  async (leadData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, leadData);
      console.log(response.data, "suspectThunx");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update a lead by ID
export const updateSuspectLead = createAsyncThunk(
  "suspectLead/update",
  async ({ id, leadData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, leadData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a lead by ID
export const deleteSuspectLead = createAsyncThunk(
  "suspectLead/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id; // return deleted id to remove from state
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
