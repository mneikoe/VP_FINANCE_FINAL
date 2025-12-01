import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/leadcity";

export const fetchDetails = createAsyncThunk("/leadcity/fetch", async () => {
  const response = await axios.get(API_URL);
  console.log(response.data);
  return response.data;
});

export const fetchDetailsById = createAsyncThunk(
  "/leadcity/fetchDetailsById",
  async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

export const createDetails = createAsyncThunk(
  "/leadcity/create",
  async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  }
);

export const updateDetails = createAsyncThunk(
  "/leadcity/update",
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  }
);

export const deleteDetails = createAsyncThunk(
  "/leadcity/delete",
  async (id) => {
    await axios.delete(`${API_URL}/delete/${id}`);
    return id;
  }
);
