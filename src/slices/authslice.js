import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = BASE_URL;
// Load from localStorage if exists
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
  registerLoading: false,
  registerError: null,
  registerSuccess: false,
};

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ first_name, password }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}auth/login/`, {
        first_name,
        password,
      });
      const { access, user } = response.data;

      // store token and user
      localStorage.setItem("token", access);
      localStorage.setItem("user", JSON.stringify(user));

      return { access, user };

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          "Login failed, please check first name or password"
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
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGOUT
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;