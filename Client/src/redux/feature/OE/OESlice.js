import { createSlice } from "@reduxjs/toolkit";
import { loginOE, registerOE } from "./OEthunx";

const initialState = {
  OE: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
    success:false
};

const OESlice = createSlice({
  name: "OE",
  initialState,
  reducers: {
    logout: (state) => {
      state.OE = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // ✅ Register
    builder
      .addCase(registerOE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerOE.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
          state.success=true
      })
      .addCase(registerOE.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // // ✅ Login
    builder
      .addCase(loginOE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOE.fulfilled, (state, action) => {
        state.loading = false;
        state.telecaller = action.payload.telecaller;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginOE.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = OESlice.actions;
export default OESlice.reducer;
