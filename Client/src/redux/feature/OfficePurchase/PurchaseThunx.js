// redux/features/officePurchase/officePurchaseThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const BASE_URL = "/api/office-purchase";

// Create
export const createOfficePurchase = createAsyncThunk(
  "officePurchase/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get All
export const fetchOfficePurchases = createAsyncThunk(
  "officePurchase/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get By ID
export const fetchOfficePurchaseByID = createAsyncThunk(
  "officePurchase/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update
export const updateOfficePurchase = createAsyncThunk(
  "officePurchase/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE_URL}/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete
export const deleteOfficePurchase = createAsyncThunk(
  "officePurchase/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
