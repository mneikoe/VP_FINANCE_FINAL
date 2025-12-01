import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFinancialProduct,
  createFinancialProduct,
  updateFinancialProduct,
  deleteFinancialProduct,
  fetchFinancialProductById,
} from "./FinancialThunx.js";

const initialState = {
  FinancialProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  success: false,
};

const FinancialProductSlice = createSlice({
  name: "financialProduct",
  initialState,
  reducers: {
    resetFinancialProductStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch FinancialProduct
      .addCase(fetchFinancialProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.FinancialProducts = action.payload;
      })
      .addCase(fetchFinancialProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch FinancialProduct by ID
      .addCase(fetchFinancialProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedProduct = null;
      })
      .addCase(fetchFinancialProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchFinancialProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create FinancialProduct
      .addCase(createFinancialProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFinancialProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.FinancialProducts.unshift(action.payload);
        state.success = true;
      })
      .addCase(createFinancialProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update FinancialProduct
      .addCase(updateFinancialProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFinancialProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.FinancialProducts.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) state.FinancialProducts[index] = action.payload;
        state.success = true;
      })
      .addCase(updateFinancialProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete FinancialProduct
      .addCase(deleteFinancialProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFinancialProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.FinancialProducts = state.FinancialProducts.filter(
          (a) => a._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteFinancialProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetFinancialProductStatus } = FinancialProductSlice.actions;
export default FinancialProductSlice.reducer;
