import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/form-company";

/* ===================== CREATE ===================== */
export const createCompanyName = createAsyncThunk(
  "formCompany/createCompanyName",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/add`, payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ===================== READ ===================== */
export const fetchCompanyNames = createAsyncThunk(
  "formCompany/fetchCompanyNames",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ===================== UPDATE ===================== */
export const updateCompanyName = createAsyncThunk(
  "formCompany/updateCompanyName",
  async ({ id, companyName }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/${id}`, {
        companyName,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ===================== DELETE ===================== */
export const deleteCompanyName = createAsyncThunk(
  "formCompany/deleteCompanyName",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
