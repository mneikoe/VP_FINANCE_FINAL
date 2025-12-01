// redux/feature/LeadType/LeadTypeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchLeadType,
  fetchLeadTypeById,
  createLeadType,
  updateLeadType,
  deleteLeadType,
} from "./LeadTypeThunx";

const initialState = {
  LeadType: [],
  detail: null,
  loading: false,
  error: null,
};

const LeadType = createSlice({
  name: "LeadType",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadType.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadType.fulfilled, (state, action) => {
        state.loading = false;
        state.LeadType = action.payload;
      })
      .addCase(fetchLeadType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLeadTypeById.fulfilled, (state, action) => {
        state.detail = action.payload;
      })
      .addCase(createLeadType.fulfilled, (state, action) => {
        state.LeadType.unshift(action.payload);
      })
      .addCase(updateLeadType.fulfilled, (state, action) => {
        const index = state.LeadType.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) state.LeadType[index] = action.payload;
      })
      .addCase(deleteLeadType.fulfilled, (state, action) => {
        state.LeadType = state.LeadType.filter((d) => d._id !== action.payload);
      });
  },
});

export default LeadType.reducer;
