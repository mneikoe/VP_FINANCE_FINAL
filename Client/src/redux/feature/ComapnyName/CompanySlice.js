import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCompanyName,
  createCompanyName,
  updateCompanyName,
  deleteCompanyName,
  fetchCompanyNameById,
} from "./CompanyThunx.js";

const initialState = {
  CompanyNames: [],
  selectedCompany: null,
  loading: false,
  error: null,
  success: false,
};

const CompanyNameSlice = createSlice({
  name: "CompanyName",
  initialState,
  reducers: {
    resetCompanyNameStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch CompanyName
      .addCase(fetchCompanyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        
        state.CompanyNames = action.payload;
      })
      .addCase(fetchCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch CompanyName by ID
      .addCase(fetchCompanyNameById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedCompany = null;
      })
      .addCase(fetchCompanyNameById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCompany = action.payload;
      })
      .addCase(fetchCompanyNameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create CompanyName
      .addCase(createCompanyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.CompanyNames.unshift(action.payload);
        state.success = true;
      })
      .addCase(createCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update CompanyName
      .addCase(updateCompanyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.CompanyNames.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) state.CompanyNames[index] = action.payload;
        state.success = true;
      })
      .addCase(updateCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete CompanyName
      .addCase(deleteCompanyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.CompanyNames = state.CompanyNames.filter(
          (a) => a._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCompanyNameStatus } = CompanyNameSlice.actions;
export default CompanyNameSlice.reducer;