import { createSlice } from "@reduxjs/toolkit";
import {
  createOfficeDiary,
  deleteOfficeDiary,
  fetchOfficeDiaries,
  fetchOfficeDiaryByID, // ✅ Add this
  updateOfficeDiary,
} from "./OfficeDiaryThunx";

const officeDiarySlice = createSlice({
  name: "officeDiary",
  initialState: {
    list: [],
    current: null, // ✅ To store single diary
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchOfficeDiaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficeDiaries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOfficeDiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch One by ID
      .addCase(fetchOfficeDiaryByID.pending, (state) => {
        state.loading = true;
        state.current = null;
        state.error = null;
      })
      .addCase(fetchOfficeDiaryByID.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchOfficeDiaryByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createOfficeDiary.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOfficeDiary.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createOfficeDiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteOfficeDiary.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      })

      // Update
      .addCase(updateOfficeDiary.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default officeDiarySlice.reducer;
