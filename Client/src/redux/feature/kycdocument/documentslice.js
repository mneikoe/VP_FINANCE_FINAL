import { createSlice } from "@reduxjs/toolkit";
import {
  createKycDocument,
  fetchKycDocuments,
  fetchKycDocumentById,
  updateKycDocument,
  deleteKycDocument,
} from "./documentthunx";

const documentSlice = createSlice({
  name: "kycdoc",
  initialState: {
    documents: [],
    currentDocument: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔵 Fetch all
      .addCase(fetchKycDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKycDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchKycDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 Create
      .addCase(createKycDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload.data);
      })

      // 🟡 Fetch One
      .addCase(fetchKycDocumentById.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
      })

      // 🟠 Update
      .addCase(updateKycDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(
          (doc) => doc._id === action.payload.data._id
        );
        if (index !== -1) {
          state.documents[index] = action.payload.data;
        }
      })

      // 🔴 Delete
      .addCase(deleteKycDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(
          (doc) => doc._id !== action.payload
        );
      });
  },
});

export default documentSlice.reducer;
