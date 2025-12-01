// src/redux/slices/compositeTaskSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createCompositeTask,
  fetchAllCompositeTasks,
  fetchCompositeTaskById,
  updateCompositeTask,
  deleteCompositeTask,
} from "./CompositeThunx"; // Adjust path if needed

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  successMessage: null,
  compositeData: {},
};

const compositeTaskSlice = createSlice({
  name: "compositeTask",
  initialState,

  reducers: {
    setCompositeData: (state, action) => {
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
      .addCase(createCompositeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCompositeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Optionally add the new task to your state if needed
        // state.tasks.push(action.payload.data);
      })
      .addCase(createCompositeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH ALL
      .addCase(fetchAllCompositeTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCompositeTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchAllCompositeTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchCompositeTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompositeTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchCompositeTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCompositeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompositeTask.fulfilled, (state, action) => {
        state.loading = false;
        // console.log(state?.tasks);
        state.tasks = action.payload
        // const index = state.tasks.findIndex(
        //   (t) => t._id === action.payload._id
        // );
        // if (index !== -1) state.tasks[index] = action.payload;
        // console.log(index);
        
        state.successMessage = "Task updated successfully.";
      })
      .addCase(updateCompositeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCompositeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompositeTask.fulfilled, (state, action) => {
        state.loading = false;
        // state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        state.tasks = action.payload
        state.successMessage = "Task deleted successfully.";
      })
      .addCase(deleteCompositeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCompositeData,
  clearError,
  clearSuccessMessage,
  clearCurrentTask,
} = compositeTaskSlice.actions;

export default compositeTaskSlice.reducer;