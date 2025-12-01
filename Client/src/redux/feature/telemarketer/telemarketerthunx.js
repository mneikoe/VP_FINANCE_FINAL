import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios"; // ✅ tumhara axios instance

// ✅ Register Thunk
export const registerTelemarketer = createAsyncThunk(
  "telemarketer/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/telemarketer/register", formData);
      return res.data; // ✅ axios automatically JSON parse karta hai
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ✅ Login Thunk
export const loginTelemarketer = createAsyncThunk(
  "Telemarketer/login",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/Telemarketer/login", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);


