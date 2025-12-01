import { createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "../../../config/axios";
import axios from "../../../config/axios";

const API_URL = "/api/leadType";

export const fetchLeadType = createAsyncThunk("/leadType/fetch", async () => {
  const response = await axios.get(API_URL);
  console.log(response.data);
  return response.data;
});

export const fetchLeadTypeById = createAsyncThunk(
  "/leadType/fetchLeadTypeById",
  async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

export const createLeadType = createAsyncThunk(
  "leadType/create",
  async (data) => {
    const response = await axios.post(API_URL, data); // data = { leadType: "Type name" }
    return response.data;
  }
);

export const updateLeadType = createAsyncThunk(
  "leadType/update",
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/${id}`, data); // data = { leadType: "new name" }
    return response.data;
  }
);

export const deleteLeadType = createAsyncThunk(
  "/leadType/delete",
  async (id) => {
    await axios.delete(`${API_URL}/delete/${id}`);
    return id;
  }
);
