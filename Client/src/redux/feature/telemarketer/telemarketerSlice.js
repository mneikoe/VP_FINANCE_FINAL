import { createSlice } from "@reduxjs/toolkit";
import { registerTelemarketer,loginTelemarketer } from "./telemarketerthunx";

const initialState = {
  telemarketer: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
   success:false
};

const telemarketerSlice = createSlice({
  name: "telemarketer",
  initialState,
  reducers: {
    logout: (state) => {
      state.telemarketer = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // ✅ Register
    builder
      .addCase(registerTelemarketer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTelemarketer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
               state.success=true
      })
      .addCase(registerTelemarketer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ✅ Login
    builder
      .addCase(loginTelemarketer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginTelemarketer.fulfilled, (state, action) => {
        state.loading = false;
        state.telecaller = action.payload.telecaller;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginTelemarketer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = telemarketerSlice.actions;
export default telemarketerSlice.reducer;
