import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/registrar"; // base URL of your backend API

// Fetch all registrars
export const fetchRegistrars = createAsyncThunk(
  "registrars/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      console.log(response.data, "fetch Registrar Thunx");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new registrar
export const createRegistrar = createAsyncThunk(
  "registrars/create",
  async (registrarData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, registrarData);
      console.log(response.data, "data from Thunx registrar");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing registrar
export const updateRegistrar = createAsyncThunk(
  "registrars/update",
  async ({ id, registrarData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, registrarData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a registrar
export const deleteRegistrar = createAsyncThunk(
  "registrars/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// fetch by id
export const getRegistrarById = createAsyncThunk(
  "registrars/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
