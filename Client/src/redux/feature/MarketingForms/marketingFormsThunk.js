import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMarketingFormsByKind,
  createMarketingFormApi,
  updateMarketingFormApi,
  deleteMarketingFormApi,
} from "./marketingFormsApi";

// GET
export const fetchMarketingForms = createAsyncThunk(
  "marketingForms/fetchByKind",
  async (kindOfForm, { rejectWithValue }) => {
    try {
      const res = await getMarketingFormsByKind(kindOfForm);
      return res.data.forms;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch forms"
      );
    }
  }
);

// CREATE
export const createMarketingForm = createAsyncThunk(
  "marketingForms/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await createMarketingFormApi(formData);
      return res.data.form;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create form"
      );
    }
  }
);

// UPDATE
export const updateMarketingForm = createAsyncThunk(
  "marketingForms/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await updateMarketingFormApi(id, formData);
      return res.data.form;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update form"
      );
    }
  }
);

// DELETE
export const deleteMarketingForm = createAsyncThunk(
  "marketingForms/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteMarketingFormApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete form"
      );
    }
  }
);
