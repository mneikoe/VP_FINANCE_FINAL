// redux/features/officePurchase/officePurchaseSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createOfficePurchase,
  fetchOfficePurchases,
  fetchOfficePurchaseByID,
  updateOfficePurchase,
  deleteOfficePurchase,
} from "./PurchaseThunx";

const initialState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

const officePurchaseSlice = createSlice({
  name: "officePurchase",
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createOfficePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOfficePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createOfficePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All
      .addCase(fetchOfficePurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficePurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOfficePurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get by ID
      .addCase(fetchOfficePurchaseByID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficePurchaseByID.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchOfficePurchaseByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateOfficePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.list[index] = action.payload;
      })

      // Delete
      .addCase(deleteOfficePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((item) => item._id !== action.payload);
      });
  },
});

export const { clearCurrent } = officePurchaseSlice.actions;
export default officePurchaseSlice.reducer;
