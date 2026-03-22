import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsAPI } from "@/api/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
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
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
    }
  }
);

export const fetchPreferences = createAsyncThunk(
  "notifications/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getPreferences();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch preferences");
    }
  }
);

export const updatePreferences = createAsyncThunk(
  "notifications/updatePreferences",
  async (data, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.updatePreferences(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update preferences");
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  isLoading: false,
  error: null,
};
