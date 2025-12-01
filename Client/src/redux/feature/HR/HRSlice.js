import { createSlice } from "@reduxjs/toolkit";
import { registerHR,loginHR } from "./HRthunx";

const initialState = {
  HR: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
    success:false
};

const HRSlice = createSlice({
  name: "HR",
  initialState,
  reducers: {
    logout: (state) => {
      state.HR = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // ✅ Register
    builder
      .addCase(registerHR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerHR.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
           state.success=true
      })
      .addCase(registerHR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ✅ Login
    builder
      .addCase(loginHR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginHR.fulfilled, (state, action) => {
        state.loading = false;
        state.telecaller = action.payload.telecaller;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginHR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = HRSlice.actions;
export default HRSlice.reducer;
