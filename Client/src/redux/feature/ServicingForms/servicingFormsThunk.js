import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getServicingFormsByKind,
  createServicingFormApi,
  updateServicingFormApi,
  deleteServicingFormApi,
} from "./servicingFormsApi";

/* ================= GET (BY KIND) ================= */
export const fetchServicingFormsByKind = createAsyncThunk(
  "servicingForms/fetchByKind",
  async (kindOfForm, { rejectWithValue }) => {
    try {
      const res = await getServicingFormsByKind(kindOfForm);
      return res.data.forms;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch servicing forms"
      );
    }
  }
);

/* ================= CREATE ================= */
export const createServicingForm = createAsyncThunk(
  "servicingForms/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await createServicingFormApi(formData);
      return res.data.form;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create servicing form"
      );
    }
  }
);

/* ================= UPDATE ================= */
export const updateServicingForm = createAsyncThunk(
  "servicingForms/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await updateServicingFormApi(id, formData);
      return res.data.form;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update servicing form"
      );
    }
  }
);

/* ================= DELETE ================= */
export const deleteServicingForm = createAsyncThunk(
  "servicingForms/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteServicingFormApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete servicing form"
      );
    }
  }
);
