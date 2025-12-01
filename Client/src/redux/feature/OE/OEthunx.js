import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios"; // ✅ tumhara axios instance

// ✅ Register Thunk
export const registerOE = createAsyncThunk(
  "OE/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/OE/register", formData);
      return res.data; // ✅ axios automatically JSON parse karta hai
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginOE = createAsyncThunk(
  "OE/login",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/OE/login", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);


