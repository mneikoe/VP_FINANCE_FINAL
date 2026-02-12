// src/redux/slices/compositeTaskSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createMarketingTask,
  deleteMarketingTask,
  fetchAllMarketingTasks,
  fetchMarketingTaskById,
  updateMarketingTask,
} from "./MarketingThunx";

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  successMessage: null,
  marketingData: {},
};

const marketingTaskSlice = createSlice({
  name: "MarketingTask",
  initialState,

  reducers: {
    setMarketingData: (state, action) => {
      state.marketingData = action.payload;
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
      .addCase(createMarketingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createMarketingTask.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Marketing task created successfully";
        state.error = null;
      })
      .addCase(createMarketingTask.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to create marketing task";
        state.successMessage = null;
      })
      // FETCH ALL
      .addCase(fetchAllMarketingTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMarketingTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload || [];
      })
      .addCase(fetchAllMarketingTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchMarketingTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketingTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchMarketingTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateMarketingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMarketingTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) state.tasks[index] = action.payload;
        state.successMessage = "Task updated successfully.";
      })
      .addCase(updateMarketingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteMarketingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMarketingTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        state.successMessage = "Task deleted successfully.";
      })
      .addCase(deleteMarketingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setMarketingData,
  clearError,
  clearSuccessMessage,
  clearCurrentTask,
} = marketingTaskSlice.actions;

export default marketingTaskSlice.reducer;
