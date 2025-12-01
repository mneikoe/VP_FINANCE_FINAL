import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";
const API_URL = "/api/prospect";
// Fetch all leads
export const fetchProspectLeads = createAsyncThunk(
  "prospectLead/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Fetch single lead by ID
export const fetchProspectLeadById = createAsyncThunk(
  "prospectLead/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Create a new lead
export const createProspectLead = createAsyncThunk(
  "prospectLead/create",
  async (leadData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, leadData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Update a lead by ID
export const updateProspectLead = createAsyncThunk(
  "prospectLead/update",
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
export const deleteProspectLead = createAsyncThunk(
  "prospectLead/delete",
  async (id, thunkAPI) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update status of a lead
export const updateLeadStatus = createAsyncThunk(
  "prospectLead/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/status/${id}`, { status });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
