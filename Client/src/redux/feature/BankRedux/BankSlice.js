import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBanks,
  createBank,
  updateBank,
  deleteBank,
  toggleBank,
} from "./BankThunx";

const initialState = {
  banks: [],
  loading: false,
  error: null,
};

const bankSlice = createSlice({
  name: "bank",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = action.payload;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE */
      .addCase(createBank.fulfilled, (state, action) => {
        state.banks.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateBank.fulfilled, (state, action) => {
        const index = state.banks.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.banks[index] = action.payload;
      })

      /* DELETE */
      .addCase(deleteBank.fulfilled, (state, action) => {
        state.banks = state.banks.filter((b) => b._id !== action.payload);
      })

      /* TOGGLE */
      .addCase(toggleBank.fulfilled, (state, action) => {
        const index = state.banks.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.banks[index] = action.payload;
      });
  },
});

export default bankSlice.reducer;