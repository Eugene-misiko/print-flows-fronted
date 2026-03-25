import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { companyAPI } from "../../api/api";

export const fetchCompany = createAsyncThunk(
  "company/fetchCompany",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.get();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch company");
    }
  }
);

export const updateCompany = createAsyncThunk(
  "company/updateCompany",
  async (data, { rejectWithValue }) => {
    try {
      const response = await companyAPI.update(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update company");
    }
  }
);

export const fetchSettings = createAsyncThunk(
  "company/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch settings");
    }
  }
);

export const updateSettings = createAsyncThunk(
  "company/updateSettings",
  async (data, { rejectWithValue }) => {
    try {
      const response = await companyAPI.updateSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update settings");
    }
  }
);

export const fetchPaymentSettings = createAsyncThunk(
  "company/fetchPaymentSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getPaymentSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch payment settings");
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  "company/updatePaymentSettings",
  async (data, { rejectWithValue }) => {
    try {
      const response = await companyAPI.updatePaymentSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update payment settings");
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  "company/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch dashboard");
    }
  }
);

export const fetchStaff = createAsyncThunk(
  "company/fetchStaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getStaff();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch staff");
    }
  }
);

export const fetchStaffStats = createAsyncThunk(
  "company/fetchStaffStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getStaffStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch staff stats");
    }
  }
);

const initialState = {
  company: null,
  settings: null,
  paymentSettings: null,
  dashboard: null,
  staff: [],
  staffStats: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.company = action.payload;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.company = action.payload;
        state.successMessage = "Company updated";
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.successMessage = "Settings updated";
      })
      .addCase(fetchPaymentSettings.fulfilled, (state, action) => {
        state.paymentSettings = action.payload;
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.paymentSettings = action.payload;
        state.successMessage = "Payment settings updated";
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.staff = action.payload.results || action.payload;
      })
      .addCase(fetchStaffStats.fulfilled, (state, action) => {
        state.staffStats = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = companySlice.actions;
export default companySlice.reducer;
