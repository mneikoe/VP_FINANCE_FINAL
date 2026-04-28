import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

/*
  IMPORTANT:
  axios baseURL must be: http://localhost:5000/api
  So BASE must NOT contain /api
*/
const BASE = "/api/income-expense-accounts";

/* ================= CREATE ================= */
export const createIncomeExpenseAccount = createAsyncThunk(
  "incomeExpenseAccount/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= FETCH ALL ================= */
export const fetchIncomeExpenseAccounts = createAsyncThunk(
  "incomeExpenseAccount/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE, {
        params: { ...params, t: Date.now() },
      });

      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= DROPDOWN ================= */
export const fetchIncomeExpenseDropdown = createAsyncThunk(
  "incomeExpenseAccount/dropdown",
  async (type, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/dropdown`, {
        params: { type },
      });

      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= UPDATE ================= */
export const updateIncomeExpenseAccount = createAsyncThunk(
  "incomeExpenseAccount/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE}/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= DELETE ================= */
export const deleteIncomeExpenseAccount = createAsyncThunk(
  "incomeExpenseAccount/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// permanent delete
export const deleteIncomeExpenseAccountPermanent = createAsyncThunk(
  "incomeExpenseAccount/deletePermanent",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/income-expense-accounts/permanent/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);