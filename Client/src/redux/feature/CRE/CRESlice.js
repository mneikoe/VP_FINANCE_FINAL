import { createSlice } from "@reduxjs/toolkit";

import { createCRE } from "./CREThunk";

const initialState = {
  loading: false,
  error: null,
  tasks: [],
  success: false,
};

const CRESlice = createSlice({
  name: "CRE",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createCRE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCRE.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(createCRE.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      });
  },
});

export default CRESlice.reducer;
