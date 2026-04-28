import { createSlice } from "@reduxjs/toolkit";
import {
  addEntry,
  getEntries,
  getEntryById,
  editEntry,
  removeEntry,
  getBalanceReport,
  getBankReport,
} from "./incomeExpenseEntryThunk";

const initialState = {
  entryList: [],
  currentEntry: null,
  balanceReport: null,
  bankReport: [],
  loading: false,
  error: null,
};

const entrySlice = createSlice({
  name: "accountEntry",
  initialState,

  reducers: {
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== GET ALL ===== */
      .addCase(getEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entryList = action.payload;
      })
      .addCase(getEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== ADD ===== */
      .addCase(addEntry.fulfilled, (state, action) => {
        state.entryList.unshift(action.payload);
      })

      /* ===== GET BY ID ===== */
      .addCase(getEntryById.fulfilled, (state, action) => {
        state.currentEntry = action.payload;
      })

      /* ===== UPDATE ===== */
      .addCase(editEntry.fulfilled, (state, action) => {
        const index = state.entryList.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) state.entryList[index] = action.payload;
      })

      /* ===== DELETE ===== */
      .addCase(removeEntry.fulfilled, (state, action) => {
        state.entryList = state.entryList.filter(
          (i) => i._id !== action.payload
        );
      })

      /* ===== BALANCE ===== */
      .addCase(getBalanceReport.fulfilled, (state, action) => {
        state.balanceReport = action.payload;
      })

      /* ===== BANK ===== */
      .addCase(getBankReport.fulfilled, (state, action) => {
        state.bankReport = action.payload;
      });
  },
});

export const { clearCurrentEntry } = entrySlice.actions;
export default entrySlice.reducer;