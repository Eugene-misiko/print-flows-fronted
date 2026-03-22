import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersAPI, companyAPI } from "../../api/api";

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateUser(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await usersAPI.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

export const inviteUser = createAsyncThunk(
  "users/inviteUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await companyAPI.inviteUser(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send invitation");
    }
  }
);

export const fetchInvitations = createAsyncThunk(
  "users/fetchInvitations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getInvitations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch invitations");
    }
  }
);

export const cancelInvitation = createAsyncThunk(
  "users/cancelInvitation",
  async (id, { rejectWithValue }) => {
    try {
      await companyAPI.cancelInvitation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel invitation");
    }
  }
);

export const fetchDesigners = createAsyncThunk(
  "users/fetchDesigners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getDesigners();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch designers");
    }
  }
);

export const fetchPrinters = createAsyncThunk(
  "users/fetchPrinters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getPrinters();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch printers");
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  invitations: [],
  designers: [],
  printers: [],
  pagination: {
    count: 0,
    next: null,
    previous: null,
    page: 1,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.successMessage = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
            page: action.meta.arg?.page || 1,
            totalPages: Math.ceil(action.payload.count / 10),
          };
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Single User
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.successMessage = "User updated successfully";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        state.successMessage = "User deleted successfully";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Invite User
    builder
      .addCase(inviteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations.push(action.payload);
        state.successMessage = "Invitation sent successfully";
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Invitations
    builder
      .addCase(fetchInvitations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = action.payload.results || action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Cancel Invitation
    builder
      .addCase(cancelInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = state.invitations.filter(i => i.id !== action.payload);
        state.successMessage = "Invitation cancelled successfully";
      })
      .addCase(cancelInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Designers
    builder
      .addCase(fetchDesigners.fulfilled, (state, action) => {
        state.designers = action.payload.results || action.payload;
      });

    // Fetch Printers
    builder
      .addCase(fetchPrinters.fulfilled, (state, action) => {
        state.printers = action.payload.results || action.payload;
      });
  },
});

export const { clearUsersError, clearUserSuccess, setCurrentUser, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;