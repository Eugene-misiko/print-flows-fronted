import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { messagingAPI } from "../../api/api";

export const fetchConversations = createAsyncThunk(
  "messaging/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversations");
    }
  }
);

export const fetchConversation = createAsyncThunk(
  "messaging/fetchConversation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.getConversation(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversation");
    }
  }
);
