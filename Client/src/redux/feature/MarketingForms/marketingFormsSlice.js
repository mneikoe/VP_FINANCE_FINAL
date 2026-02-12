import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMarketingForms,
  createMarketingForm,
  updateMarketingForm,
  deleteMarketingForm,
} from "./marketingFormsThunk";

const marketingFormsSlice = createSlice({
  name: "marketingForms",
  initialState: {
    forms: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchMarketingForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketingForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchMarketingForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createMarketingForm.fulfilled, (state, action) => {
        state.forms.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateMarketingForm.fulfilled, (state, action) => {
        const index = state.forms.findIndex(
          (f) => f._id === action.payload._id
        );
        if (index !== -1) {
          state.forms[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteMarketingForm.fulfilled, (state, action) => {
        state.forms = state.forms.filter(
          (f) => f._id !== action.payload
        );
      });
  },
});

export default marketingFormsSlice.reducer;
