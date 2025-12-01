
import { createSlice } from "@reduxjs/toolkit";
import {
  createOccupation,
  getAllOccupations,
  getOccupationById,
  updateOccupation,
  deleteOccupation
} from "./OccupationThunx";

const initialState = {
  alldetails: [],
  singleDetailForOccupation: null,
  loading: false,
  error: null,
  success: false,
};

const LeadOccupationSlice = createSlice({
  name: "leadOccupation",
  initialState,
  reducers: {
    // A reducer to reset the 'success' flag after a successful operation
    resetSuccess: (state) => {
      state.success = false;
    },
    // A reducer to clear any errors
    clearError: (state) => {
      state.error = null;
    },
    // A reducer to clear the single item 'detail'
    clearDetail: (state) => {
      state.detail = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================== Fetch All Occupations ===========================
      .addCase(getAllOccupations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOccupations.fulfilled, (state, action) => {
        state.loading = false;
        state.alldetails = action.payload; // Correctly sets the array
        state.error = null;
      })
      .addCase(getAllOccupations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.alldetails = []; // Reset to empty array on failure
      })

      // =========================== Fetch Single Occupation by ID ===================
      .addCase(getOccupationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOccupationById.fulfilled, (state, action) => {
        state.loading = false;
        state. singleDetailForOccupation = action.payload; // Correctly sets the single item
        state.error = null;
      })
      .addCase(getOccupationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.detail = null; // Reset to null on failure
      })

      // =========================== Create New Occupation ===========================
      .addCase(createOccupation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOccupation.fulfilled, (state, action) => {
        state.loading = false;
        state.alldetails.unshift(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createOccupation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // =========================== Update Occupation ===============================
      .addCase(updateOccupation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOccupation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.alldetails.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) {
          state.alldetails[index] = action.payload;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateOccupation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // =========================== Delete Occupation ===============================
      .addCase(deleteOccupation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteOccupation.fulfilled, (state, action) => {
        state.loading = false;
       
        state.alldetails = state.alldetails.filter((d) => d._id !== action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteOccupation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetSuccess, clearError, clearDetail } = LeadOccupationSlice.actions;
export default LeadOccupationSlice.reducer;
