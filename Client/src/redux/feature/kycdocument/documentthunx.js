import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

// ✅ 1. Create KYC Document
export const createKycDocument = createAsyncThunk(
  "kyc/create",
  async (docData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/kycdocument", docData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create document"
      );
    }
  }
);

// ✅ 2. Get All KYC Documents
export const fetchKycDocuments = createAsyncThunk(
  "kyc/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/kycdocument");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch documents"
      );
    }
  }
);

// ✅ 3. Get Single Document by ID
export const fetchKycDocumentById = createAsyncThunk(
  "kyc/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/kycdocument/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch document"
      );
    }
  }
);

// ✅ 4. Update Document
export const updateKycDocument = createAsyncThunk(
  "kyc/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/kycdocument/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update document"
      );
    }
  }
);

// ✅ 5. Delete Document
export const deleteKycDocument = createAsyncThunk(
  "kyc/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/kycdocument/${id}`);
      return id; // return deleted id so we can remove from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete document"
      );
    }
  }
);
