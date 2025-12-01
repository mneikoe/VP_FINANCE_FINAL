import { createSlice } from "@reduxjs/toolkit";

import {
  createSuspect,
  addFamilyMember,
  addFinancialInfo,
  addFuturePrioritiesAndNeeds,
  addProposedFinancialPlan,
  getAllSuspects,
  getSuspectById,
  updateSuspectStatus,
  updateSuspectPersonalDetails,
  deleteSuspectById,
  getAllFamilyMembers,
  getAllSuspectsOnlyAppointMentDone,
} from "./SuspectThunx";
// import { actions } from "react-table";

const initialState = {
  suspects: [],
  currentSuspect: null,
  loading: false,
  success: false,
  error: null,
  suspectData: null,
  familyMembers: null,
  financialInfo: null,
  futurePriorities: null,
  proposedPlan: null,
  suspects: [],
  singleSuspect: null,
  familyMembers: [],
};

const suspectSlice = createSlice({
  name: "suspect",
  initialState,
  reducers: {
    resetSuspectState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // createSuspect
      .addCase(createSuspect.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSuspect.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.prospectData = action.payload;
      })
      .addCase(createSuspect.rejected, (state, action) => {
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

      // getAllSuspects
      .addCase(getAllSuspects.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllSuspects.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.suspects = action.payload;
      })
      .addCase(getAllSuspects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getSuspectById
      .addCase(getSuspectById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getSuspectById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleSuspect = action.payload;
      })
      .addCase(getSuspectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleSuspect = null;
      })

      // updateSuspectStatus
      .addCase(updateSuspectStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSuspectStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleSuspect = action.payload;
      })
      .addCase(updateSuspectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleSuspect = null;
      })
      .addCase(updateSuspectPersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSuspectPersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.singleSuspect = action.payload;
      })
      .addCase(updateSuspectPersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singleSuspect = null;
      })
      // delete suspect
      .addCase(deleteSuspectById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSuspectById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.payload.id || action.payload._id;
        state.suspects = state.suspects.filter(
          (suspect) => suspect._id !== deletedId
        );
      })

      .addCase(deleteSuspectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllFamilyMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllFamilyMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.familyMembers = action.payload;
      })
      .addCase(getAllFamilyMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllSuspectsOnlyAppointMentDone.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllSuspectsOnlyAppointMentDone.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.familyMembers = action.payload;
      })
      .addCase(getAllSuspectsOnlyAppointMentDone.rejected, (state, actions) => {
        state.loading = false;
        state.error = actions.payload;
      });
  },
});

export const { resetSuspectState } = suspectSlice.actions;
export default suspectSlice.reducer;
