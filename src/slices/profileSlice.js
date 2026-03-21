import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

// Fetch authenticated user profile
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/auth/profile/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch profile");
    }
  }
);

// Update profile (supports FormData for avatar)
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (updatedData, thunkAPI) => {
    try {
      let response;
      // If sending FormData (file upload)
      if (updatedData instanceof FormData) {
        response = await api.put("/auth/profile/", updatedData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // fallback for normal JSON updates
        response = await api.put("/auth/profile/", updatedData);
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to update profile");
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export default profileSlice.reducer;