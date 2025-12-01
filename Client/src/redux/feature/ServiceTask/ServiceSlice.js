// src/redux/slices/compositeTaskSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createServiceTask,
  deleteServiceTask,
  fetchAllServiceTasks,
  fetchServiceTaskById,
  updateServiceTask,
} from "./ServiceThunx";

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  successMessage: null,
  serviceData: {},
};

const serviceTaskSlice = createSlice({
  name: "ServiceTask",
  initialState,

  reducers: {
    setServiceData: (state, action) => {
      state.compositeData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createServiceTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createServiceTask.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Optionally add the new task to your state if needed
        // state.tasks.push(action.payload.data);
      })
      .addCase(createServiceTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH ALL
      .addCase(fetchAllServiceTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllServiceTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchAllServiceTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchServiceTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchServiceTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateServiceTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServiceTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) state.tasks[index] = action.payload;
        state.successMessage = "Task updated successfully.";
      })
      .addCase(updateServiceTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteServiceTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteServiceTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        state.successMessage = "Task deleted successfully.";
      })
      .addCase(deleteServiceTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setServiceData,
  clearError,
  clearSuccessMessage,
  clearCurrentTask,
} = serviceTaskSlice.actions;

export default serviceTaskSlice.reducer;
