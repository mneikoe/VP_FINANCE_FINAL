import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/leadsubarea";

// Fetch all sub areas with populated area data
export const fetchSubAreas = createAsyncThunk(
  "subArea/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Create new sub area
export const createSubArea = createAsyncThunk(
  "subArea/create",
  async ({ areaId, subAreaName }, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, { areaId, subAreaName });
      console.log(response.data, "klsdjfdsfjls");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Update existing sub area
export const updateSubArea = createAsyncThunk(
  "subArea/update",
  async ({ id, subAreaData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, subAreaData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Delete sub area
export const deleteSubArea = createAsyncThunk(
  "subArea/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);
