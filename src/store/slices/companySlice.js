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
// Fetch company by slug (for public pages)
export const getCompanyBySlug = createAsyncThunk(
  "company/getBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await companyAPI.getBySlug(slug);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to fetch company");
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
export const searchCompanies = createAsyncThunk(
  "company/searchCompanies",
  async (params, { rejectWithValue }) => {
    try {
      const response = await companyAPI.search(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to search companies"
      );
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
  company: {},
    companies: [],
  companiesMeta: {
    count: 0,
    next: null,
    previous: null,
  },
  settings: {},
  paymentSettings: {},
  dashboard: {},
  staff: [],
  staffStats: {},
  isLoading: false,
  error: null,
  successMessage: null,
};
const normalizeList = (payload) =>
  payload?.results || payload?.data || payload || [];
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
  },
    extraReducers: (builder) => {
      builder
        //FETCH COMPANY
        .addCase(fetchCompany.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchCompany.fulfilled, (state, action) => {
          state.isLoading = false;
          state.company = action.payload;
        })
        .addCase(fetchCompany.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // UPDATE COMPANY
        .addCase(updateCompany.pending, (state) => {
          state.isLoading = true;
          state.error = null;
          state.successMessage = null;
        })
        .addCase(updateCompany.fulfilled, (state, action) => {
          state.isLoading = false;
          state.company = action.payload;
          state.successMessage = "Company updated";
        })
        .addCase(updateCompany.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })
        .addCase(searchCompanies.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(searchCompanies.fulfilled, (state, action) => {
          state.isLoading = false;

          // support paginated or non-paginated API
          state.companies = action.payload.results || action.payload;

          state.companiesMeta = {
            count: action.payload.count || 0,
            next: action.payload.next || null,
            previous: action.payload.previous || null,
          };
        })
        .addCase(searchCompanies.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })
        //FETCH SETTINGS 
        .addCase(fetchSettings.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchSettings.fulfilled, (state, action) => {
          state.isLoading = false;
          state.settings = action.payload;
        })
        .addCase(fetchSettings.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        //UPDATE SETTINGS
        .addCase(updateSettings.pending, (state) => {
          state.isLoading = true;
          state.error = null;
          state.successMessage = null;
        })
        .addCase(updateSettings.fulfilled, (state, action) => {
          state.isLoading = false;
          state.settings = action.payload;
          state.successMessage = "Settings updated";
        })
        .addCase(updateSettings.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        //FETCH PAYMENT SETTINGS 
        .addCase(fetchPaymentSettings.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchPaymentSettings.fulfilled, (state, action) => {
          state.isLoading = false;
          state.paymentSettings = action.payload;
        })
        .addCase(fetchPaymentSettings.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // UPDATE PAYMENT SETTINGS
        .addCase(updatePaymentSettings.pending, (state) => {
          state.isLoading = true;
          state.error = null;
          state.successMessage = null;
        })
        .addCase(updatePaymentSettings.fulfilled, (state, action) => {
          state.isLoading = false;
          state.paymentSettings = action.payload;
          state.successMessage = "Payment settings updated";
        })
        .addCase(updatePaymentSettings.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // DASHBOARD
        .addCase(fetchDashboard.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchDashboard.fulfilled, (state, action) => {
          state.isLoading = false;
          state.dashboard = action.payload;
        })
        .addCase(fetchDashboard.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // STAFF
        .addCase(fetchStaff.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchStaff.fulfilled, (state, action) => {
          state.isLoading = false;
          state.staff = normalizeList(action.payload);
        })
        .addCase(fetchStaff.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // STAFF STATS
        .addCase(fetchStaffStats.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchStaffStats.fulfilled, (state, action) => {
          state.isLoading = false;
          state.staffStats = action.payload;
        })
        .addCase(fetchStaffStats.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        });
    }
});

export const { clearError, clearSuccess } = companySlice.actions;
export default companySlice.reducer;
