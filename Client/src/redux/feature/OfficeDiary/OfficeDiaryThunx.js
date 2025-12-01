import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const BASE_URL = "/api/office-diary";

// GET all diaries
export const fetchOfficeDiaries = createAsyncThunk(
  "officeDiary/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(BASE_URL);
      console.log(response.data);
      return response.data; // Assuming wrapped in { message, data }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
// GET one diary by ID
export const fetchOfficeDiaryByID = createAsyncThunk(
  "officeDiary/fetchByID",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// CREATE a diary
export const createOfficeDiary = createAsyncThunk(
  "officeDiary/create",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE a diary
export const updateOfficeDiary = createAsyncThunk(
  "officeDiary/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await axios.put(`${BASE_URL}/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// DELETE a diary
export const deleteOfficeDiary = createAsyncThunk(
  "officeDiary/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/delete/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
