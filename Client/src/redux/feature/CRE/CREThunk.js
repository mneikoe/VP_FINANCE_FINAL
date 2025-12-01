import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../config/axios";

const API_URL = "/api/cre";

export const createCRE = createAsyncThunk(
  "compositeTask/creCreated",
  async (formData, { rejectWithValue }) => {
    console.log(formData);

    try {
      const response = await axios.post(`${API_URL}`, formData);

      console.log(response);

      // Return success message along with data
      return {
        data: response.data,
        message: "Task created successfully",
      };
    } catch (err) {
      // Enhanced error handling
      let errorMessage = err.message;
      if (err.response) {
        if (err.response.data) {
          errorMessage =
            err.response.data.message ||
            err.response.data.error ||
            JSON.stringify(err.response.data);
        } else {
          errorMessage = `Server responded with status ${err.response.status}`;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);
