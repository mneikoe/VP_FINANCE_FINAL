import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/employee";

// 🟣 GET ALL EMPLOYEES - COMPLETE FIX
export const getAllEmployees = createAsyncThunk(
  "employee/getAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Thunk: Fetching all employees...");
      const response = await axios.get(`${API_URL}/getAllEmployees`);
      
      console.log("✅ Thunk: GET ALL EMPLOYEES RAW RESPONSE:", response);
      console.log("✅ Thunk: Response Data:", response.data);
      console.log("✅ Thunk: Employees Array:", response.data.data);
      console.log("✅ Thunk: Employees Array Length:", response.data.data.length);
      
      // ✅ CRITICAL FIX: Return the exact structure that slice expects
      // Your API returns: { success: true, message: "...", data: array }
      return {
        data: response.data.data, // Direct array of employees
        message: response.data.message || "All employees fetched successfully",
        success: response.data.success
      };
    } catch (err) {
      console.error("❌ Thunk Error:", err);
      
      let errorMessage = err.message;
      if (err.response?.data) {
        errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// 🟢 CREATE EMPLOYEE
export const createEmployee = createAsyncThunk(
  "employee/create",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("🔄 Thunk: Sending employee data...", formData);
      
      const response = await axios.post(`${API_URL}/addEmployee`, formData);
      
      console.log("✅ Thunk: CREATE EMPLOYEE RESPONSE:", response.data);
      
      return {
        data: response.data.data,
        message: response.data.message || "Employee created successfully",
      };
    } catch (err) {
      console.error("❌ Thunk Error:", err);
      
      let errorMessage = err.message || "Unknown error occurred";
      
      if (err.response?.data) {
        errorMessage = err.response.data.message || 
                     err.response.data.error || 
                     JSON.stringify(err.response.data);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// 🟡 UPDATE EMPLOYEE
export const updateEmployee = createAsyncThunk(
  "employee/update",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/updateEmployee`, formData);
      return {
        data: response.data.data,
        message: response.data.message || "Employee updated successfully",
      };
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.data) {
        errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔵 GET EMPLOYEE BY ID
export const getEmployeeById = createAsyncThunk(
  "employee/getById",
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/getEmployeeById`, {
        params: { employeeId },
      });
      return {
        data: response.data.data,
        message: response.data.message || "Employee fetched successfully",
      };
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.data) {
        errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔴 DELETE EMPLOYEE
export const deleteEmployee = createAsyncThunk(
  "employee/delete",
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteEmployee`, {
        params: { employeeId },
      });
      return {
        data: response.data.data,
        message: response.data.message || "Employee deleted successfully",
      };
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.data) {
        errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
      }
      return rejectWithValue(errorMessage);
    }
  }
);