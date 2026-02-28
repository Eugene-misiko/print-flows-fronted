import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_,thunkAPI) => {
    try {
      const response = await api.get("/auth/users/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch users"
      );
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userListSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userListSlice.reducer;