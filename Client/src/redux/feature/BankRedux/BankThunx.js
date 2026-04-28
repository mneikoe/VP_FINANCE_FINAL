import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

/* ================= FETCH ALL ================= */
export const fetchBanks = createAsyncThunk("bank/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/api/banks");
    return Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

/* ================= CREATE ================= */
export const createBank = createAsyncThunk("bank/create", async (payload, thunkAPI) => {
  try {
    const res = await axios.post("/api/banks", payload);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

/* ================= UPDATE ================= */
export const updateBank = createAsyncThunk(
  "bank/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axios.put(`/api/banks/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= DELETE ================= */
export const deleteBank = createAsyncThunk("bank/delete", async (id, thunkAPI) => {
  try {
    await axios.delete(`/api/banks/${id}`);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

/* ================= TOGGLE ================= */
export const toggleBank = createAsyncThunk("bank/toggle", async (id, thunkAPI) => {
  try {
    const res = await axios.patch(`/api/banks/toggle/${id}`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});