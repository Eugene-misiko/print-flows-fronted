import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = BASE_URL;

// Attach token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Load stored data
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");
const storedRefresh = localStorage.getItem("refresh");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  refresh: storedRefresh || null,
  loading: false,
  error: null,

  registerLoading: false,
  registerError: null,
  registerSuccess: false,

  // New state for password flows
  passwordLoading: false,
  passwordError: null,
  passwordSuccess: null,
};

// LOGIN (Updated to use Email)

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}auth/login/`, {
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { access, refresh, user };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          "Login failed, please check email or password"
      );
    }
  }
);


// REGISTER

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ first_name, last_name, email, phone, password, role }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}auth/register/`, {
        first_name,
        last_name,
        email,
        phone,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Registration failed"
      );
    }
  }
);


// LOGOUT

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await axios.post(`${API_URL}auth/logout/`, { refresh });
      }
      return true;
    } catch (error) {
      return true;
    }
  }
);


// CHANGE PASSWORD (Logged in user)

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ old_password, new_password, new_password_confirm }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}auth/change_password/`, {
        old_password,
        new_password,
        new_password_confirm,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to change password"
      );
    }
  }
);

// REQUEST PASSWORD RESET (Forgot Password - Step 1)

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async ({ email }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}auth/request_reset/`, {
        email,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to send reset email"
      );
    }
  }
);


// CONFIRM PASSWORD RESET 

export const confirmPasswordReset = createAsyncThunk(
  "auth/confirmPasswordReset",
  async ({ uidb64, token, new_password, new_password_confirm }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}auth/reset_confirm/`, {
        uidb64,
        token,
        new_password,
        new_password_confirm,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to reset password"
      );
    }
  }
);


// SLICE

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Helper to clear password states when navigating away
    resetPasswordState: (state) => {
      state.passwordLoading = false;
      state.passwordError = null;
      state.passwordSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.refresh = action.payload.refresh;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerLoading = false;
        state.registerError = null;
        state.registerSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
        state.registerSuccess = false;
      });

    // LOGOUT
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refresh = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
    });

    // CHANGE PASSWORD
    builder
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordSuccess = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.passwordSuccess = action.payload.message || "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload;
      });

    // REQUEST PASSWORD RESET
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordSuccess = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.passwordSuccess = action.payload.message || "Reset email sent";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload;
      });

    // CONFIRM PASSWORD RESET
    builder
      .addCase(confirmPasswordReset.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordSuccess = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.passwordSuccess = action.payload.message || "Password reset successful";
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload;
      });
  },
});
export const { resetPasswordState } = authSlice.actions;
export default authSlice.reducer;