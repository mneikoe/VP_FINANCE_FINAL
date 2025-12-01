import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bcnt: 0,
  cdcnt:0,
  flcnt:0,
  rlcnt:0,
  adcnt:0
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setBalanceCount: (state, action) => {
      state.bcnt = action.payload;
    },
      setcallingdoneCount: (state, action) => {
      state.cdcnt = action.payload;
    },  setforwardedleadCount: (state, action) => {
      state.flcnt = action.payload;
    }, setrejectedleadCount: (state, action) => {
      state.rlcnt = action.payload;
    }, setappointmentdoneCount: (state, action) => {
      state.adcnt = action.payload;
    },

  },
});

export const { setBalanceCount, setcallingdoneCount,setforwardedleadCount,setrejectedleadCount,setappointmentdoneCount} = dashboardSlice.actions;
export default dashboardSlice.reducer;
