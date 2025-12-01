import { createSlice } from "@reduxjs/toolkit";
import {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  deleteEmployee,
  getAllEmployees,
} from "./EmployeeThunk";

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    employees: [],
    employee: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetEmployeeState: (state) => {
      state.employees = [];
      state.employee = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    // Manual set for testing
    setEmployees: (state, action) => {
      state.employees = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // GET ALL EMPLOYEES - MAIN FIX
      .addCase(getAllEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 SLICE: GET ALL EMPLOYEES PENDING");
      })
      .addCase(getAllEmployees.fulfilled, (state, action) => {
        state.loading = false;
        console.log("✅ SLICE: GET ALL EMPLOYEES FULFILLED");
        console.log("✅ SLICE: Full Action:", action);
        console.log("✅ SLICE: Action Payload:", action.payload);
        console.log("✅ SLICE: Employees Data:", action.payload.data);
        console.log("✅ SLICE: Employees Data Type:", typeof action.payload.data);
        console.log("✅ SLICE: Is Array?", Array.isArray(action.payload.data));
        
        // ✅ CRITICAL FIX: Direct assignment
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.employees = action.payload.data;
          console.log("🎉 SLICE: Employees successfully set in Redux:", state.employees.length);
          console.log("🎉 SLICE: First employee:", state.employees[0]?.name);
        } else {
          console.warn("⚠️ SLICE: Unexpected data structure:", action.payload);
          state.employees = [];
        }
        
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getAllEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log("❌ SLICE: GET ALL EMPLOYEES ERROR:", action.payload);
      })

      // CREATE EMPLOYEE
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        if (action.payload.data) {
          state.employees.push(action.payload.data);
        }
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET EMPLOYEE BY ID
      .addCase(getEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.employee = action.payload.data;
        }
      })
      .addCase(getEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE EMPLOYEE
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        if (action.payload.data) {
          const updatedEmployee = action.payload.data;
          const index = state.employees.findIndex(emp => emp._id === updatedEmployee._id);
          if (index !== -1) {
            state.employees[index] = updatedEmployee;
          }
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE EMPLOYEE
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        if (action.payload.data && action.payload.data._id) {
          const deletedEmployeeId = action.payload.data._id;
          state.employees = state.employees.filter(emp => emp._id !== deletedEmployeeId);
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, resetEmployeeState, setEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;