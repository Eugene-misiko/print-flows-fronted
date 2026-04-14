import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsAPI } from "../../api/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch notifications");
    }
  }
);

// export const fetchNotification = createAsyncThunk(
//   "notifications/fetchNotification",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await notificationsAPI.getById(id);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.error || "Failed to fetch notification");
//     }
//   }
// );

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to mark all as read");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch unread count");
    }
  }
);

const initialState = {
  notifications: [],
  currentNotification: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => { state.error = null; },
  },
extraReducers: (builder) => {
  builder
    .addCase(fetchNotifications.fulfilled, (state, action) => {
      state.currentNotification = action.payload;
    })  
    .addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
    })
    // .addCase(fetchNotifications.fulfilled, (state, action) => {
    //   state.isLoading = false;
    //   state.notifications = action.payload.results || action.payload;
    // })
    .addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(markAsRead.fulfilled, (state, action) => {
      const idx = state.notifications.findIndex(n => n.id === action.payload.id);
      if (idx !== -1) state.notifications[idx] = action.payload;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    })
    .addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
      state.unreadCount = 0;
    })
    .addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload.unread_count;
    });
}
});

export const { addNotification, clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
