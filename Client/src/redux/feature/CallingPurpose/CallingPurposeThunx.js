import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/calling-purpose";

export const fetchCallingPurposes = createAsyncThunk(
  "/callingPurpose/fetch",
  async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
);

export const createCallingPurpose = createAsyncThunk(
  "/callingPurpose/create",
  async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  }
);

export const updateCallingPurpose = createAsyncThunk(
  "/callingPurpose/update",
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  }
);

export const deleteCallingPurpose = createAsyncThunk(
  "/callingPurpose/delete",
  async (id) => {
    await axios.delete(`${API_URL}/delete/${id}`);
    return id;
  }
);
