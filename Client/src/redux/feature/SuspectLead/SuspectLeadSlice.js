import { createSlice } from "@reduxjs/toolkit";
import {
  createSuspectLead,
  deleteSuspectLead,
  fetchSuspectLeadById,
  fetchSuspectLeads,
  updateSuspectLead,
} from "./SuspectLeadThunx";

const SuspectLeadSlice = createSlice({
  name: "suspectLead",
  initialState: {
    leads: [],
    currentLead: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentLead(state) {
      state.currentLead = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all leads
      .addCase(fetchSuspectLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuspectLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(fetchSuspectLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch lead by id
      .addCase(fetchSuspectLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuspectLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchSuspectLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create lead
      .addCase(createSuspectLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSuspectLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.push(action.payload);
      })
      .addCase(createSuspectLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update lead
      .addCase(updateSuspectLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSuspectLead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leads.findIndex(
          (lead) => lead._id === action.payload._id
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        // Also update currentLead if it's the one updated
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = action.payload;
        }
      })
      .addCase(updateSuspectLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete lead
      .addCase(deleteSuspectLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSuspectLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter((lead) => lead._id !== action.payload);
        if (state.currentLead?._id === action.payload) {
          state.currentLead = null;
        }
      })
      .addCase(deleteSuspectLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentLead, clearError } = SuspectLeadSlice.actions;

export default SuspectLeadSlice.reducer;
