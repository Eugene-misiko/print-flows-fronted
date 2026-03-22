import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "@/api/api";

// Async thunks
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const updateProfileData = createAsyncThunk(
  "profile/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  }
);

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.successMessage = "Profile updated successfully";
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, clearSuccessMessage } = profileSlice.actions;
export default profileSlice.reducer;