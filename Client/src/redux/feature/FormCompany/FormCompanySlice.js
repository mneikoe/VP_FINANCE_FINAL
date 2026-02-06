import { createSlice } from "@reduxjs/toolkit";
import {
  createCompanyName,
  fetchCompanyNames,
  updateCompanyName,
  deleteCompanyName,
} from "./FormCompanyThunx";

const FormCompanySlice = createSlice({
  name: "formCompany",
  initialState: {
    companies: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearFormCompanyState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ========== CREATE ========== */
      .addCase(createCompanyName.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.companies.unshift(action.payload);
      })
      .addCase(createCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ========== READ ========== */
      .addCase(fetchCompanyNames.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanyNames.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanyNames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ========== UPDATE ========== */
      .addCase(updateCompanyName.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const index = state.companies.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      })
      .addCase(updateCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ========== DELETE ========== */
      .addCase(deleteCompanyName.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.companies = state.companies.filter(
          (c) => c._id !== action.payload
        );
      })
      .addCase(deleteCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFormCompanyState } = FormCompanySlice.actions;
export default FormCompanySlice.reducer;
