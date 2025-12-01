import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSubAreas,
  createSubArea,
  updateSubArea,
  deleteSubArea,
} from "./SubAreaThunx";

const initialState = {
  subAreas: [],
  loading: false,
  error: null,
  currentSubArea: null,
};

const subAreaSlice = createSlice({
  name: "leadSubArea",
  initialState,
  reducers: {
    setCurrentSubArea: (state, action) => {
      state.currentSubArea = action.payload;
    },
    clearCurrentSubArea: (state) => {
      state.currentSubArea = null;
    },
    resetSubAreaState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sub areas
      .addCase(fetchSubAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.subAreas = action.payload;
      })
      .addCase(fetchSubAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create sub area
      .addCase(createSubArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubArea.fulfilled, (state, action) => {
        state.loading = false;
        state.subAreas.push(action.payload);
      })
      .addCase(createSubArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update sub area
      .addCase(updateSubArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubArea.fulfilled, (state, action) => {
        state.loading = false;
        state.subAreas = state.subAreas.map((subArea) =>
          subArea._id === action.payload._id ? action.payload : subArea
        );
      })
      .addCase(updateSubArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete sub area
      .addCase(deleteSubArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubArea.fulfilled, (state, action) => {
        state.loading = false;
        state.subAreas = state.subAreas.filter(
          (subArea) => subArea._id !== action.payload
        );
      })
      .addCase(deleteSubArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentSubArea, clearCurrentSubArea, resetSubAreaState } =
  subAreaSlice.actions;

export default subAreaSlice.reducer;
