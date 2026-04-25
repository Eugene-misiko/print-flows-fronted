import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { conversationsAPI, messagesAPI, messagingAPI } from "../../api/api";

// ==================== CONVERSATIONS ====================

export const fetchConversations = createAsyncThunk(
  "messaging/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await conversationsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch conversations");
    }
  }
);

export const fetchConversation = createAsyncThunk(
  "messaging/fetchConversation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await conversationsAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch conversation");
    }
  }
);

export const createConversation = createAsyncThunk(
  "messaging/createConversation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await conversationsAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to create conversation");
    }
  }
);

export const updateConversation = createAsyncThunk(
  "messaging/updateConversation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await conversationsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update conversation");
    }
  }
);

export const deleteConversation = createAsyncThunk(
  "messaging/deleteConversation",
  async (id, { rejectWithValue }) => {
    try {
      await conversationsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete conversation");
    }
  }
);

export const startConversation = createAsyncThunk(
  "messaging/startConversation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await conversationsAPI.start(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to start conversation");
    }
  }
);

export const setTyping = createAsyncThunk(
  "messaging/setTyping",
  async ({ conversationId, isTyping }, { rejectWithValue }) => {
    try {
      await conversationsAPI.setTyping(conversationId, isTyping);
      return { conversationId, isTyping };
    } catch (error) {
      return rejectWithValue("Failed to set typing status");
    }
  }
);

// ==================== MESSAGES ====================

export const fetchMessages = createAsyncThunk(
  "messaging/fetchMessages",
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      const response = await conversationsAPI.getMessages(conversationId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch messages");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messaging/sendMessage",
  async (data, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.send(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to send message");
    }
  }
);

// ==================== UNREAD ====================

export const fetchUnread = createAsyncThunk(
  "messaging/fetchUnread",
  async (_, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.getUnread();
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch unread");
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unread: [],
  typingUsers: {},
  isLoading: false,
  error: null,
  successMessage: null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (isTyping && !state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.results || action.payload;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
        state.successMessage = "Conversation created";
      })
      .addCase(updateConversation.fulfilled, (state, action) => {
        const idx = state.conversations.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.conversations[idx] = action.payload;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
      })
    .addCase(startConversation.fulfilled, (state, action) => {
      state.conversations.unshift(action.payload.conversation);
      state.currentConversation = action.payload.conversation;
      state.messages.push(action.payload.message);
    })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const data = action.payload;
        const incoming = Array.isArray(data)
          ? data
          : data?.results || [];

        const existingIds = new Set(state.messages.map(m => m.id));

        const merged = [
          ...state.messages,
          ...incoming.filter(m => !existingIds.has(m.id))
        ];

        state.messages = merged;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.successMessage = "Message sent";
      })
      .addCase(fetchUnread.fulfilled, (state, action) => {
        state.unread = action.payload.results || action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentConversation, addMessage, updateTyping } = messagingSlice.actions;
export default messagingSlice.reducer;
