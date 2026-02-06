import { createSlice } from "@reduxjs/toolkit";
import {
  fetchServicingFormsByKind,
  createServicingForm,
  updateServicingForm,
  deleteServicingForm,
} from "./servicingFormsThunk";

const servicingFormsSlice = createSlice({
  name: "servicingForms",

  initialState: {
    forms: [],
    loading: false,
    error: null,
  },

  reducers: {
    clearServicingFormsError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= GET ================= */
      .addCase(fetchServicingFormsByKind.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicingFormsByKind.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchServicingFormsByKind.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */
      .addCase(createServicingForm.pending, (state) => {
        state.loading = true;
      })
      .addCase(createServicingForm.fulfilled, (state, action) => {
        state.loading = false;
        state.forms.unshift(action.payload);
      })
      .addCase(createServicingForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */
      .addCase(updateServicingForm.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateServicingForm.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.forms.findIndex(
          (f) => f._id === action.payload._id
        );
        if (index !== -1) {
          state.forms[index] = action.payload;
        }
      })
      .addCase(updateServicingForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= DELETE ================= */
      .addCase(deleteServicingForm.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteServicingForm.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = state.forms.filter(
          (f) => f._id !== action.payload
        );
      })
      .addCase(deleteServicingForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearServicingFormsError } =
  servicingFormsSlice.actions;

export default servicingFormsSlice.reducer;
