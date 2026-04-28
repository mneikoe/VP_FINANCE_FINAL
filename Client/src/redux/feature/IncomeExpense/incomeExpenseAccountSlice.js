import { createSlice } from "@reduxjs/toolkit";
import {
  createIncomeExpenseAccount,
  fetchIncomeExpenseAccounts,
  fetchIncomeExpenseDropdown,
  updateIncomeExpenseAccount,
  deleteIncomeExpenseAccount,          // soft delete
  deleteIncomeExpenseAccountPermanent, // hard delete
} from "./incomeExpenseAccountThunk";

const initialState = {
  accounts: [],
  dropdownAccounts: [],
  loading: false,
  error: null,
};

const incomeExpenseAccountSlice = createSlice({
  name: "incomeExpenseAccount",
  initialState,
  reducers: {
    clearIncomeExpenseError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= CREATE ================= */
      .addCase(createIncomeExpenseAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIncomeExpenseAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?._id) state.accounts.unshift(action.payload);
      })
      .addCase(createIncomeExpenseAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH ================= */
      .addCase(fetchIncomeExpenseAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncomeExpenseAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchIncomeExpenseAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */
      .addCase(updateIncomeExpenseAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(
          (a) => a._id === action.payload._id
        );

        if (index !== -1) state.accounts[index] = action.payload;
      })

      /* ================= SOFT DELETE ================= */
      .addCase(deleteIncomeExpenseAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(
          (a) => a._id === action.payload
        );

        if (index !== -1) state.accounts[index].isActive = false;
      })

      /* ================= PERMANENT DELETE ================= */
      .addCase(deleteIncomeExpenseAccountPermanent.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(a => a._id !== action.payload);
      })

      /* ================= DROPDOWN ================= */
      .addCase(fetchIncomeExpenseDropdown.fulfilled, (state, action) => {
        state.dropdownAccounts = Array.isArray(action.payload)
          ? action.payload
          : [];
      });
  },
});

export const { clearIncomeExpenseError } = incomeExpenseAccountSlice.actions;
export default incomeExpenseAccountSlice.reducer;