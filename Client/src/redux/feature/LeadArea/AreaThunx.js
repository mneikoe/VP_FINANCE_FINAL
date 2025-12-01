import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/leadarea";

export const fetchAreas = createAsyncThunk(
  "leadArea/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createArea = createAsyncThunk(
  "leadArea/create",
  async (areaData, { rejectWithValue }) => {
    try {
      // ✅ Correct field mapping
      const payload = {
        name: areaData.name,
        shortcode: areaData.shortcode,
        pincode: areaData.pincode,
        city: areaData.city,
      };

      const response = await axios.post(API_URL, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateArea = createAsyncThunk(
  "leadArea/update",
  async ({ id, areaData }, { rejectWithValue }) => {
    try {
      const payload = {
        name: areaData.name,
        shortcode: areaData.shortcode,
        pincode: areaData.pincode,
        city: areaData.city,
      };
      const response = await axios.put(`${API_URL}/${id}`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteArea = createAsyncThunk(
  "leadArea/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
