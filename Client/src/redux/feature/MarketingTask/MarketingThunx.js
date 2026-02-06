import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/Task";

// create TASKS
export const createMarketingTask = createAsyncThunk(
  "marketingTask/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/Task/", formData);
      return {
        data: response.data,
        message: "Task created successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message
      );
    }
  }
);



export const fetchAllMarketingTasks = createAsyncThunk(
  "marketingTask/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/?type=marketing&status=template&limit=1000&page=1`
      );
      return res.data.tasks; // 👈 only array
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
        `/api/Task/${id}?type=marketing`,
        formData
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
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
