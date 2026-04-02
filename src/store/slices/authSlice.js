import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI, invitationsAPI } from "../../api/api";

// ===================== LOGIN =====================
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, tokens } = response.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Invalid email or password"
      );
    }
  }
);

// ===================== REGISTER USER (CLIENT) =====================
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.registerUser(data); 
      const { user, tokens } = response.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (error) {
      const errors = error.response?.data;

      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors)[0];
        return rejectWithValue(
          Array.isArray(firstError) ? firstError[0] : firstError
        );
      }

      return rejectWithValue("User registration failed");
    }
  }
);

// ===================== FETCH COMPANIES =====================
export const fetchCompanies = createAsyncThunk(
  "auth/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCompanies(); // make sure API exists
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch companies");
    }
  }
);
// ===================== REGISTER COMPANY =====================
export const registerCompany = createAsyncThunk(
  "auth/registerCompany",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.registerCompany(data);
      const { user, tokens } = response.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (error) {
      const errors = error.response?.data;
      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors)[0];
        return rejectWithValue(Array.isArray(firstError) ? firstError[0] : firstError);
      }
      return rejectWithValue("Registration failed");
    }
  }
);

// ===================== REGISTER WITH INVITATION =====================
export const registerWithInvitation = createAsyncThunk(
  "auth/registerWithInvitation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      const { user, tokens } = response.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (error) {
      const errors = error.response?.data;
      if (errors && typeof errors === "object") {
        if (errors.password) return rejectWithValue(errors.password[0]);
        if (errors.email) return rejectWithValue(errors.email[0]);
        if (errors.invitation_token) return rejectWithValue(errors.invitation_token[0]);
        if (errors.non_field_errors) return rejectWithValue(errors.non_field_errors[0]);
        const firstError = Object.values(errors)[0];
        return rejectWithValue(Array.isArray(firstError) ? firstError[0] : firstError);
      }
      return rejectWithValue("Registration failed");
    }
  }
);

// ===================== FETCH INVITATION BY TOKEN =====================
export const fetchInvitationByToken = createAsyncThunk(
  "auth/fetchInvitationByToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await invitationsAPI.getByToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Invalid or expired invitation"
      );
    }
  }
);

// ===================== CHANGE PASSWORD =====================
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(data);
      return response.data;
    } catch (error) {
      const errors = error.response?.data;
      if (errors?.old_password) return rejectWithValue(errors.old_password[0]);
      if (errors?.new_password) return rejectWithValue(errors.new_password[0]);
      if (errors?.non_field_errors) return rejectWithValue(errors.non_field_errors[0]);
      return rejectWithValue(error.response?.data?.error || "Failed to change password");
    }
  }
);

// ===================== LOGOUT =====================
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authAPI.logout();
  } finally {
    localStorage.clear();
  }
});

// ===================== FETCH PROFILE =====================
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch profile");
    }
  }
);

// ===================== INITIAL STATE =====================
const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  currentInvitation: null,
  companies: [],
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,
  successMessage: null,
};

// ===================== SLICE =====================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    logoutLocal: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    clearCurrentInvitation: (state) => {
      state.currentInvitation = null;
    },
  },
  extraReducers: (builder) => {
    builder
    // FETCH COMPANIES
    .addCase(fetchCompanies.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(fetchCompanies.fulfilled, (state, action) => {
      state.isLoading = false;
      state.companies = action.payload.results || action.payload;
    })
    .addCase(fetchCompanies.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // REGISTER USER
    .addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })    
      // LOGIN
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // REGISTER COMPANY
      .addCase(registerCompany.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerCompany.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(registerCompany.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // REGISTER INVITATION
      .addCase(registerWithInvitation.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerWithInvitation.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(registerWithInvitation.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // FETCH INVITATION
      .addCase(fetchInvitationByToken.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchInvitationByToken.fulfilled, (state, action) => { state.isLoading = false; state.currentInvitation = action.payload; })
      .addCase(fetchInvitationByToken.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => { state.isLoading = true; })
      .addCase(changePassword.fulfilled, (state, action) => { state.isLoading = false; state.successMessage = action.payload.message || "Password changed successfully"; })
      .addCase(changePassword.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      // PROFILE
      .addCase(fetchProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.isLoading = false; state.user = null; state.isAuthenticated = false; state.error = action.payload; })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => { state.user = null; state.isAuthenticated = false; });
  },
});

export const { clearError, clearSuccess, logoutLocal, clearCurrentInvitation } = authSlice.actions;
export default authSlice.reducer;