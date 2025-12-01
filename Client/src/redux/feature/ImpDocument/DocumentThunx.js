import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const BASE_URL = "/api/important-documents";

// CREATE
export const createImportantDocument = createAsyncThunk(
  "importantDocuments/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// READ ALL
export const fetchImportantDocuments = createAsyncThunk(
  "importantDocuments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// READ BY ID
export const fetchImportantDocumentByID = createAsyncThunk(
  "importantDocuments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// UPDATE
export const updateImportantDocument = createAsyncThunk(
  "importantDocuments/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// DELETE
export const deleteImportantDocument = createAsyncThunk(
  "importantDocuments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
