import { createSlice } from "@reduxjs/toolkit";

import { registerOA ,loginOA} from "./OAthunx";

const initialState = {
  OA: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
    success:false
};

const OASlice = createSlice({
  name: "OA",
  initialState,
  reducers: {
    logout: (state) => {
      state.OA = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // ✅ Register
    builder
      .addCase(registerOA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerOA.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
           state.success=true
      })
      .addCase(registerOA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ✅ Login
    builder
      .addCase(loginOA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOA.fulfilled, (state, action) => {
        state.loading = false;
        state.telecaller = action.payload.telecaller;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginOA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = OASlice.actions;
export default OASlice.reducer;
