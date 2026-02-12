import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/Task";


// GET ALL TASKS
export const createServiceTask = createAsyncThunk(
  "serviceTask/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/Task", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.task;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


export const fetchAllServiceTasks = createAsyncThunk(
  "serviceTask/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/Task?type=service");
      return response.data.tasks || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


// GET TASK BY ID
export const fetchServiceTaskById = createAsyncThunk(
  "serviceTask/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}?type=service`);
      return response.data.task; // ✅ FIX
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



export const updateServiceTask = createAsyncThunk(
  "serviceTask/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/Task/${id}?type=service`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.task;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


// DELETE TASK
export const deleteServiceTask = createAsyncThunk(
  "serviceTask/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}/?type=service`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
