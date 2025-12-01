
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";


const API_URL = "/api/occupation";

// create Occupations
export const createOccupation = createAsyncThunk(
  "/leadOccupation/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL,data);
      console.log("Occupation created successfully:", response.data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to create lead occupation"
      );
    }
  }
);


// Get all occupations
export const getAllOccupations = createAsyncThunk(
  "/leadOccupation/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch lead occupations"
      );
    }
  }
);

// Get occupation by ID
export const getOccupationById = createAsyncThunk(
  "/leadOccupation/fetchDetailsById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch lead occupation details"
      );
    }
  }
);

// Update occupation by ID
export const updateOccupation = createAsyncThunk(
  "/leadOccupation/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to update lead occupation"
      );
    }
  }
);

// Delete occupation by ID
export const deleteOccupation = createAsyncThunk(
  "/leadOccupation/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to delete lead occupation"
      );
    }
  }
);