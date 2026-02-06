import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/meeting-purpose";

// 🔹 GET ALL
export const fetchDetails = createAsyncThunk(
  "/meetingpurpose/fetch",
  async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
);

// 🔹 GET BY ID
export const fetchDetailsById = createAsyncThunk(
  "/meetingpurpose/fetchDetailsById",
  async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

// 🔹 CREATE
export const createDetails = createAsyncThunk(
  "/meetingpurpose/create",
  async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  }
);

// 🔹 UPDATE
export const updateDetails = createAsyncThunk(
  "/meetingpurpose/update",
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  }
);

// 🔹 DELETE
export const deleteDetails = createAsyncThunk(
  "/meetingpurpose/delete",
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);
