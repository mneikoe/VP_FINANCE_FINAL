
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";
const BASE_URL = "/api/occupation/types";


// Create OccupationType
export const createOccupationType = createAsyncThunk(
  "occupationType/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(BASE_URL, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to create occupation type"
      );
    }
  }
);


// Get all OccupationTypes
export const getAllOccupationTypes = createAsyncThunk(
  "occupationType/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch occupation types"
      );
    }
  }
);

// Get OccupationType by ID
export const getOccupationTypeById = createAsyncThunk(
  "occupationType/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch occupation type"
      );
    }
  }
);

// Update OccupationType
export const updateOccupationType = createAsyncThunk(
  "occupationType/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to update occupation type"
      );
    }
  }
);

// Delete OccupationType
export const deleteOccupationType = createAsyncThunk(
  "occupationType/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to delete occupation type"
      );
    }
  }
);