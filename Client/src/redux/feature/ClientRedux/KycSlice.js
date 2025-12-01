
import { createSlice } from "@reduxjs/toolkit";
import { createKyc, deleteKyc, fetchKycsByClient, updateKyc } from "./KycThunx";

const initialState = {
  loading: false,
  success: false,
  error: null,
  kycData: [],
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    resetKycState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.kycData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createKyc.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.kycData.push(action.payload);
      })
      .addCase(createKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchKycsByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchKycsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.kycData = action.payload;
      })
      .addCase(fetchKycsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKyc.fulfilled, (state, action) => {  
        state.loading = false;
        state.success = true; 
        state.kycData = state.kycData.filter(kyc => kyc._id !== action.payload._id);
      })    
      .addCase(deleteKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKyc.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.kycData.findIndex(kyc => kyc._id === action.payload._id);
        if (index !== -1) {
          state.kycData[index] = action.payload;
        }
      })
      .addCase(updateKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
       

  },
});

export const { resetKycState } = kycSlice.actions;
export default kycSlice.reducer;