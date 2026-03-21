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

export const createConversation = createAsyncThunk(
  "messaging/createConversation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.createConversation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create conversation");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messaging/fetchMessages",
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.getMessages(conversationId, params);
      return { conversationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
    }
  }
);


export const sendMessage = createAsyncThunk(
  "messaging/sendMessage",
  async ({ conversationId, data }, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.sendMessage(conversationId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "messaging/markMessagesAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await messagingAPI.markMessagesAsRead(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);
