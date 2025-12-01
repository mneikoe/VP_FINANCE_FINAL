

import { createSlice } from "@reduxjs/toolkit";
import { createOccupationType, deleteOccupationType, getAllOccupationTypes, getOccupationTypeById, updateOccupationType } from "./OccupationThunx";



const initialState = {
  alldetailsForTypes: [],
  loading: false,
  error: null,
  singleDetailForType : null,
};

const OccupationTypeSlice = createSlice({
  name: "OccupationType",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch all occupation types
      .addCase(getAllOccupationTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOccupationTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.alldetailsForTypes = action.payload;
      })
      .addCase(getAllOccupationTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch occupation types";
      })
      .addCase(createOccupationType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOccupationType.fulfilled, (state, action) => {
        state.loading = false;
        state.alldetailsForTypes.push(action.payload);
      })
      .addCase(createOccupationType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create occupation type";
      })

      // Fetch single occupation type by ID
      .addCase(getOccupationTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOccupationTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleDetailForType = action.payload;
        state.error = null;
      })
      .addCase(getOccupationTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleDetailForType = null;
      })
      // Update occupation type
        .addCase(updateOccupationType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOccupationType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.alldetailsForTypes.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.alldetailsForTypes[index] = action.payload;
        }
      })
      .addCase(updateOccupationType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update occupation type";
      })


      // Delete occupation type
      .addCase(deleteOccupationType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOccupationType.fulfilled, (state, action) => {
        state.loading = false;
        state.alldetailsForTypes = state.alldetailsForTypes.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteOccupationType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete occupation type";
      });
  },
});

export const { 
  resetSuccess, 
  clearError, 
  clearDetail, 
  clearDeletedCount 
} = OccupationTypeSlice.actions;

export default OccupationTypeSlice.reducer;