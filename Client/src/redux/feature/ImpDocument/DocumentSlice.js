import { createSlice } from "@reduxjs/toolkit";
import {
  createImportantDocument,
  fetchImportantDocuments,
  fetchImportantDocumentByID,
  updateImportantDocument,
  deleteImportantDocument,
} from "./DocumentThunx.js";

const initialState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

const importantDocumentSlice = createSlice({
  name: "importantDocuments",
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createImportantDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(createImportantDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createImportantDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All
      .addCase(fetchImportantDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchImportantDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchImportantDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch One
      .addCase(fetchImportantDocumentByID.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      // Update
      .addCase(updateImportantDocument.fulfilled, (state, action) => {
        state.list = state.list.map((doc) =>
          doc._id === action.payload._id ? action.payload : doc
        );
        state.current = null;
        state.loading = false;
      })

      // Delete
      .addCase(deleteImportantDocument.fulfilled, (state, action) => {
        state.list = state.list.filter((doc) => doc._id !== action.payload);
      });
  },
});

export const { clearCurrent } = importantDocumentSlice.actions;
export default importantDocumentSlice.reducer;
