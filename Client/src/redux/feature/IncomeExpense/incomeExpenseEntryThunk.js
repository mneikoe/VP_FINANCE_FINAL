import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../config/axios";

const URL = "/api/income-expense";

/* ========= ADD ========= */
export const addEntry = createAsyncThunk(
  "entry/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(URL, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ========= GET ALL ========= */
export const getEntries = createAsyncThunk(
  "entry/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get(URL, { params });
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ========= GET BY ID ========= */
export const getEntryById = createAsyncThunk(
  "entry/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`${URL}/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ========= UPDATE ========= */
export const editEntry = createAsyncThunk(
  "entry/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${URL}/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ========= DELETE ========= */
export const removeEntry = createAsyncThunk(
  "entry/remove",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ========= BALANCE ========= */
export const getBalanceReport = createAsyncThunk(
  "entry/balance",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${URL}/summary/balance`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ========= BANK REPORT ========= */
export const getBankReport = createAsyncThunk(
  "entry/bank",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${URL}/summary/bank`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);