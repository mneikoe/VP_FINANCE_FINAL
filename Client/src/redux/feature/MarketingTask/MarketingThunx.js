import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/Task";

export const createMarketingTask = createAsyncThunk(
  "marketingTask/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Return success message along with data
      return {
        data: response.data,
        message: "Task created successfully",
      };
    } catch (err) {
      // Enhanced error handling
      let errorMessage = err.message;
      if (err.response) {
        if (err.response.data) {
          errorMessage =
            err.response.data.message ||
            err.response.data.error ||
            JSON.stringify(err.response.data);
        } else {
          errorMessage = `Server responded with status ${err.response.status}`;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// GET ALL TASKS
export const fetchAllMarketingTasks = createAsyncThunk(
  "marketingTask/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/?type=marketing`);

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// GET TASK BY ID
export const fetchMarketingTaskById = createAsyncThunk(
  "marketingTask/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/?type=marketing`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// UPDATE TASK
export const updateMarketingTask = createAsyncThunk(
  "marketingTask/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${id}/?type=marketing`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.task;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// DELETE TASK
export const deleteMarketingTask = createAsyncThunk(
  "marketingTask/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}/?type=marketing`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
