import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/Task";

export const createCompositeTask = createAsyncThunk(
  "compositeTask/create",
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
    console.log(id, formData);

    try {
      const response = await axios.put(
        `${API_URL}/${id}?type=composite`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(response);

      return response?.data?.task;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
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

// CREATE TASK
// export const createCompositeTask = createAsyncThunk(
//   "compositeTask/create",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(API_URL, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       return response.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   }
// );
