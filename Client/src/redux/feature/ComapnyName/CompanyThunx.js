import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/CompanyName";
// get all
export const fetchCompanyName = createAsyncThunk(
  " CompanyName/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      console.log(response.data, "data from thunx");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// get By Id
export const fetchCompanyNameById = createAsyncThunk(
  " CompanyName/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// create
export const createCompanyName = createAsyncThunk(
  " CompanyName/create",
  async (CompanyNameData, { rejectWithValue }) => {
    try {
      // Transform data to match backend schema

      const response = await axios.post(API_URL, CompanyNameData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// update
export const updateCompanyName = createAsyncThunk(
  " CompanyName/update",
  async ({ id, CompanyNameData }, { rejectWithValue }) => {
    try {
      // Transform data to match backend schema
      const payload = { ...CompanyNameData };
      const response = await axios.put(`${API_URL}/${id}`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// delete
export const deleteCompanyName = createAsyncThunk(
  " CompanyName/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
