import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCallingPurposes,
  createCallingPurpose,
  updateCallingPurpose,
  deleteCallingPurpose,
} from "./CallingPurposeThunx";

const initialState = {
  callingPurposes: [],
  loading: false,
  error: null,
};

const callingPurposeSlice = createSlice({
  name: "callingPurpose",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallingPurposes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCallingPurposes.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.callingPurposes = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      })
      .addCase(fetchCallingPurposes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCallingPurpose.fulfilled, (state, action) => {
        if (!Array.isArray(state.callingPurposes)) {
          state.callingPurposes = [];
        }
        state.callingPurposes.unshift(action.payload);
      })
      .addCase(updateCallingPurpose.fulfilled, (state, action) => {
        const index = state.callingPurposes.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.callingPurposes[index] = action.payload;
      })
      .addCase(deleteCallingPurpose.fulfilled, (state, action) => {
        state.callingPurposes = state.callingPurposes.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export default callingPurposeSlice.reducer;
