import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/Task";


// GET ALL TASKS

export const createCompositeTask = createAsyncThunk(
  "compositeTask/create",
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


export const fetchAllCompositeTasks = createAsyncThunk(
  "compositeTask/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/?type=composite`);
      console.log(response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// GET TASK BY ID
export const fetchCompositeTaskById = createAsyncThunk(
  "compositeTask/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}?type=composite`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// UPDATE TASK

export const updateCompositeTask = createAsyncThunk(
  "compositeTask/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/Task/${id}?type=composite`,
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
export const deleteCompositeTask = createAsyncThunk(
  "compositeTask/delete",
  async (id, { rejectWithValue }) => {
    console.log(id);

    try {
      await axios.delete(`${API_URL}/delete/${id}?type=composite`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

