import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

// ✅ Login Thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      // ✅ IMPROVED: Prepare data based on what's provided
      let requestData = {};

      if (loginData.employeeCode) {
        requestData = {
          employeeCode: loginData.employeeCode,
          password: loginData.password,
        };
      } else if (loginData.email) {
        requestData = {
          email: loginData.email,
          password: loginData.password,
        };
      } else if (loginData.loginId) {
        // If loginId is provided, determine if it's email or employee code
        const isEmployeeCode = /^[A-Z]{2}\d+$/.test(loginData.loginId); // Pattern like TC1234, HR5678

        if (isEmployeeCode) {
          requestData = {
            employeeCode: loginData.loginId,
            password: loginData.password,
          };
        } else {
          requestData = {
            email: loginData.loginId,
            password: loginData.password,
          };
        }
      }

      console.log("📤 Sending login data:", requestData);

      const response = await axios.post("/api/auth/login", requestData);

      // Token ko localStorage me save karna
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  // ⚠️ EVERYTHING gets removed
  localStorage.clear();

  return true;
});
