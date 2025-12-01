import { createSlice } from "@reduxjs/toolkit";

import {
  createClient,
  addFamilyMember,
  addFinancialInfo,
  addFuturePrioritiesAndNeeds,
  updateFuturePrioritiesAndNeeds,
  addProposedFinancialPlan,
  updateProposedStatus,
  getAllClients,
  getClientById,
  updateProposedFinancialPlan,
  updateCleintStatus,
  updateClientPersonalDetails,
  deleteClientById,
  getAllFamilyMembers
} from "./ClientThunx";


const initialState = {
  clients: [],
  currentClient: null,
  loading: false,
  success: false,
  error: null,
  clientData: null,
  familyMembers: null,
  financialInfo: null,
  futurePriorities: null,
  proposedPlan: null,
  clients: [],
  singleClient: null,
  familyMembers : [],
};



const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    resetClientState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // createClient
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.clientData = action.payload;
      })
      .addCase(createClient.rejected, (state, action) => {
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
      //Update Proposed status
      .addCase(updateProposedStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.proposedPlan = action.payload;
      })
      // getAllClients
      .addCase(getAllClients.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllClients.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.clients = action.payload;
      })
      .addCase(getAllClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getClientById
      .addCase(getClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleClient = action.payload;
      })
      .addCase(getClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleClient = null;
      })

      // updateClientStatus
      .addCase(updateCleintStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCleintStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleClient = action.payload;
      })
      .addCase(updateCleintStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleClient = null;
      })
      .addCase(updateClientPersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateClientPersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleClient = action.payload;
      })
      .addCase(updateClientPersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleClient = null;
      })
      // delete client
      .addCase(deleteClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.payload.id || action.payload._id;
        state.clients = state.clients.filter(client => client._id !== deletedId);
      })
    
      .addCase(deleteClientById.rejected, (state, action) => {
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
            // updateFuturePrioritiesAndNeeds
      .addCase(updateFuturePrioritiesAndNeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateFuturePrioritiesAndNeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.futurePriorities = action.payload;
      })
      .addCase(updateFuturePrioritiesAndNeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
          .addCase(updateProposedFinancialPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProposedFinancialPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.futurePriorities = action.payload;
      })
      .addCase(updateProposedFinancialPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export const { resetClientState } = clientSlice.actions;
export default clientSlice.reducer;