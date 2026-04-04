import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersAPI, invitationsAPI } from "../../api/api";

// Fetch all users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch users");
    }
  }
);

// Fetch single user
export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch user");
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update user");
    }
  }
);

// Deactivate user
export const deactivateUser = createAsyncThunk(
  "users/deactivateUser",
  async (id, { rejectWithValue }) => {
    try {
      await usersAPI.deactivate(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to deactivate user");
    }
  }
);

// Change user role - role must be lowercase: 'designer', 'printer', 'client'
export const changeUserRole = createAsyncThunk(
  "users/changeUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.changeRole(id, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to change role");
    }
  }
);

// Fetch invitations
export const fetchInvitations = createAsyncThunk(
  "users/fetchInvitations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await invitationsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch invitations");
    }
  }
);

// Fetch invitation by token
export const fetchInvitationByToken = createAsyncThunk(
  "users/fetchInvitationByToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await invitationsAPI.getByToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Invalid invitation");
    }
  }
);

// Create invitation - role must be lowercase: 'designer', 'printer', 'client'
export const createInvitation = createAsyncThunk(
  "users/createInvitation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await invitationsAPI.create(data);
      return response.data;
    } catch (error) {
      const errors = error.response?.data;
      if (typeof errors === "object") {
        const firstError = Object.values(errors)[0];
        return rejectWithValue(Array.isArray(firstError) ? firstError[0] : firstError);
      }
      return rejectWithValue("Failed to send invitation");
    }
  }
);

// Cancel invitation
export const cancelInvitation = createAsyncThunk(
  "users/cancelInvitation",
  async (id, { rejectWithValue }) => {
    try {
      await invitationsAPI.cancel(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to cancel invitation");
    }
  }
);

// Resend invitation
export const resendInvitation = createAsyncThunk(
  "users/resendInvitation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await invitationsAPI.resend(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to resend invitation");
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  invitations: [],
  currentInvitation: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    clearCurrentInvitation: (state) => { state.currentInvitation = null; },
  },
    extraReducers: (builder) => {
      builder

        //  FETCH USERS 
        .addCase(fetchUsers.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
          state.isLoading = false;
          state.users = action.payload.results || action.payload;
        })
        .addCase(fetchUsers.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // FETCH USER 
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
        })

        //UPDATE USER 
        .addCase(updateUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
          state.successMessage = null;
        })
        .addCase(updateUser.fulfilled, (state, action) => {
          state.isLoading = false;

          const idx = state.users.findIndex(u => u.id === action.payload.id);
          if (idx !== -1) state.users[idx] = action.payload;

          state.successMessage = "User updated";
        })
        .addCase(updateUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        //DEACTIVATE USER 
        .addCase(deactivateUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(deactivateUser.fulfilled, (state, action) => {
          state.isLoading = false;

          const idx = state.users.findIndex(u => u.id === action.payload);
          if (idx !== -1) {
            state.users[idx].is_active = false;
          }

          state.successMessage = "User deactivated";
        })
        .addCase(deactivateUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        //CHANGE ROLE
        .addCase(changeUserRole.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(changeUserRole.fulfilled, (state, action) => {
          state.isLoading = false;

          const updatedUser = action.payload;
          const idx = state.users.findIndex(u => u.id === updatedUser.id);
          if (idx !== -1) state.users[idx] = updatedUser;

          state.successMessage = "Role changed";
        })
        .addCase(changeUserRole.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        // INVITATIONS 
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
        })

        // CREATE INVITATION 
        .addCase(createInvitation.pending, (state) => {
          state.isLoading = true;
          state.error = null;
          state.successMessage = null;
        })
        .addCase(createInvitation.fulfilled, (state, action) => {
          state.isLoading = false;
          state.invitations.unshift(action.payload);
          state.successMessage = "Invitation sent";
        })
        .addCase(createInvitation.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })

        //  CANCEL INVITATION
        .addCase(cancelInvitation.fulfilled, (state, action) => {
          state.invitations = state.invitations.filter(i => i.id !== action.payload);
          state.successMessage = "Invitation cancelled";
        })

        // RESEND INVITATION 
        .addCase(resendInvitation.fulfilled, (state) => {
          state.successMessage = "Invitation resent";
        });
    }
});

export const { clearError, clearSuccess, clearCurrentInvitation } = usersSlice.actions;
export default usersSlice.reducer;
