import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = BASE_URL;

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,       // for login
  error: null,          // for login
  registerLoading: false,
  registerError: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}auth/login/`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.access);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Login failed, please check your password or username"
      );
    }
  }
);

//New registration thunk
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ username, email, phone, password }, thunkAPI) => {
    try {
      console.log("Sending registration data:", { username, email, phone, password });
      const response = await axios.post(`${API_URL}auth/register/`, {
        username,
        email,
        phone,
        password,
        
      });
      return response.data;
    } catch (error) {
      console.log("Error response:", error.response?.data);
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
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
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

    // --Registration
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.user = action.payload; 
        state.registerError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 