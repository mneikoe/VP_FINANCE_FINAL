import { createSlice } from "@reduxjs/toolkit";
import {
  createAMC,
  deleteAMC,
  fetchAMC,
  getAMCById,
  updateAMC,
} from "./AMCThunx";

const initialState = {
  AMCs: [],
  selectedAMC: null,
  loading: false,
  error: null,
};

const AmcSlice = createSlice({
  name: "AMC",
  initialState,
  reducers: {
    resetAMCStatus(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all registrars
      .addCase(fetchAMC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAMC.fulfilled, (state, action) => {
        state.loading = false;
        state.registrars = action.payload;
      })
      .addCase(fetchAMC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create registrar
      .addCase(createAMC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAMC.fulfilled, (state, action) => {
        state.loading = false;
        state.registrars.push(action.payload);
      })
      .addCase(createAMC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get registrar by ID
      .addCase(getAMCById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedAMC = null;
      })
      .addCase(getAMCById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAMC = action.payload;
      })
      .addCase(getAMCById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update registrar
      .addCase(updateAMC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAMC.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.registrars.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.registrars[index] = action.payload;
        }
      })
      .addCase(updateAMC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete registrar
      .addCase(deleteAMC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAMC.fulfilled, (state, action) => {
        state.loading = false;
        state.registrars = state.registrars.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteAMC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAMCStatus } = AmcSlice.actions;

export default AmcSlice.reducer;
