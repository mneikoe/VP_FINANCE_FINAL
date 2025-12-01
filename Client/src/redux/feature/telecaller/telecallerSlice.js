import { createSlice } from "@reduxjs/toolkit";
import { registerTelecaller, loginTelecaller } from "./telecallerthunx";

const initialState = {
  telecaller: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  success:false
};

const telecallerSlice = createSlice({
  name: "telecaller",
  initialState,
  reducers: {
    logout: (state) => {
      state.telecaller = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // ✅ Register
    builder
      .addCase(registerTelecaller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTelecaller.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success=true
      })
      .addCase(registerTelecaller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ✅ Login
    builder
      .addCase(loginTelecaller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginTelecaller.fulfilled, (state, action) => {
        state.loading = false;
        state.telecaller = action.payload.telecaller;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginTelecaller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = telecallerSlice.actions;
export default telecallerSlice.reducer;
