import { createSlice } from "@reduxjs/toolkit";
import { fetchAreas, createArea, updateArea, deleteArea } from "./AreaThunx";

const initialState = {
  areas: [],
  loading: false,
  error: null,
  success: false,
};

const areaSlice = createSlice({
  name: "leadArea",
  initialState,
  reducers: {
    resetAreaStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Areas
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Area
      .addCase(createArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas.unshift(action.payload);
        state.success = true;
      })
      .addCase(createArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Area
      .addCase(updateArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArea.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.areas.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) state.areas[index] = action.payload;
        state.success = true;
      })
      .addCase(updateArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Area
      .addCase(deleteArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = state.areas.filter((a) => a._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAreaStatus } = areaSlice.actions;
export default areaSlice.reducer;
