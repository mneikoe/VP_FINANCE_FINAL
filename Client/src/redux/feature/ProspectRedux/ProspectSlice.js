import { createSlice } from "@reduxjs/toolkit";

import {
  createProspect,
  addFamilyMember,
  addFinancialInfo,
  addFuturePrioritiesAndNeeds,
  addProposedFinancialPlan,
  getAllProspects,
  getProspectById,
  updateProspectStatus,
  updateProspectPersonalDetails,
  deleteProspectById,
  getAllFamilyMembers
} from "./ProspectThunx";


const initialState = {
  prospects: [],
  currentProspect: null,
  loading: false,
  success: false,
  error: null,
  prospectData: null,
  familyMembers: null,
  financialInfo: null,
  futurePriorities: null,
  proposedPlan: null,
  prospects: [],
  singleProspect: null,
  familyMembers : [],
};



const prospectSlice = createSlice({
  name: 'prospect',
  initialState,
  reducers: {
    resetProspectState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // createProspect
      .addCase(createProspect.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProspect.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.prospectData = action.payload;
      })
      .addCase(createProspect.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addFamilyMember
      .addCase(addFamilyMember.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.familyMembers = action.payload;
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addFinancialInfo
      .addCase(addFinancialInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addFinancialInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.financialInfo = action.payload;
      })
      .addCase(addFinancialInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addFuturePrioritiesAndNeeds
      .addCase(addFuturePrioritiesAndNeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addFuturePrioritiesAndNeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.futurePriorities = action.payload;
      })
      .addCase(addFuturePrioritiesAndNeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addProposedFinancialPlan
      .addCase(addProposedFinancialPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addProposedFinancialPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.proposedPlan = action.payload;
      })
      .addCase(addProposedFinancialPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAllProspects
      .addCase(getAllProspects.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllProspects.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.prospects = action.payload;
      })
      .addCase(getAllProspects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getClientById
      .addCase(getProspectById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getProspectById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleProspect = action.payload;
      })
      .addCase(getProspectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleProspect = null;
      })

      // updateProspectStatus
      .addCase(updateProspectStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProspectStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleProspect = action.payload;
      })
      .addCase(updateProspectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleProspect = null;
      })
      .addCase(updateProspectPersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProspectPersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleProspect = action.payload;
      })
      .addCase(updateProspectPersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleProspect = null;
      })
      // delete prospect
      .addCase(deleteProspectById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProspectById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.payload.id || action.payload._id;
        state.prospects = state.prospects.filter(prospect => prospect._id !== deletedId);
      })
    
      .addCase(deleteProspectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })
      .addCase(getAllFamilyMembers.pending, (state)=>{
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllFamilyMembers.fulfilled, (state, action)=>{
        state.loading = false;
        state.success = true;
        state.familyMembers = action.payload
      })
      .addCase(getAllFamilyMembers.rejected, (state, action)=>{
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { resetProspectState } = prospectSlice.actions;
export default prospectSlice.reducer;
