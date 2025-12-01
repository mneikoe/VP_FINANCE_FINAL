import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/AMC"; // base URL of your backend API

// Fetch all AMCs
export const fetchAMC = createAsyncThunk(
  "AMCs/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      console.log(response.data, "fetch AMC Thunx");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new AMC
export const createAMC = createAsyncThunk(
  "AMCs/create",
  async (AMCData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, AMCData);
      console.log(response.data, "data from Thunx AMC");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing AMC
export const updateAMC = createAsyncThunk(
  "AMCs/update",
  async ({ id, AMCData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, AMCData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a AMC
export const deleteAMC = createAsyncThunk(
  "AMCs/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// fetch by id
export const getAMCById = createAsyncThunk(
  "AMCs/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
