// src/features/aditya/adityaSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDetails,
  fetchDetailsById,
  createDetails,
  updateDetails,
  deleteDetails,
} from "./CityThunx";

const initialState = {
  details: [],
  detail: null,
  loading: false,
  error: null,
};

const LeadCity = createSlice({
  name: "leadcity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch One
      .addCase(fetchDetailsById.fulfilled, (state, action) => {
        state.detail = action.payload;
      })

      // Create
      .addCase(createDetails.fulfilled, (state, action) => {
        state.details.unshift(action.payload);
      })

      // Update
      .addCase(updateDetails.fulfilled, (state, action) => {
        const index = state.details.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) state.details[index] = action.payload;
      })

      // Delete
      .addCase(deleteDetails.fulfilled, (state, action) => {
        state.details = state.details.filter((d) => d._id !== action.payload);
      });
  },
});

export default LeadCity.reducer;
