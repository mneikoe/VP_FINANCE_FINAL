import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProspectLeads,
  fetchProspectLeadById,
  createProspectLead,
  updateProspectLead,
  deleteProspectLead,
} from "./ProspectThunx";
const ProspectLeadSlice = createSlice({
  name: "prospectLead",
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
      .addCase(fetchProspectLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProspectLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(fetchProspectLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch lead by id
      .addCase(fetchProspectLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProspectLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchProspectLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create lead
      .addCase(createProspectLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProspectLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.push(action.payload);
        state.currentLead = action.payload;
      })
      .addCase(createProspectLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update lead
      .addCase(updateProspectLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProspectLead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leads.findIndex(
          (lead) => lead._id === action.payload._id
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
          state.currentLead = action.payload;
        }
      })
      .addCase(updateProspectLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // delete lead
      .addCase(deleteProspectLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProspectLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter(
          (lead) => lead._id !== action.payload._id
        );
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = null;
        }
      })
      .addCase(deleteProspectLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const {
  clearCurrentLead: clearProspectCurrentLead,
  clearError: clearProspectError,
} = ProspectLeadSlice.actions;
export default ProspectLeadSlice.reducer;
