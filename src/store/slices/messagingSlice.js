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


const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update last message in conversation list
      const convIndex = state.conversations.findIndex(
        c => c.id === action.payload.conversation
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].last_message = action.payload;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    clearMessagingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.results || action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Single Conversation
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

// Create Conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.data.results || action.payload.data;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        // Update last message in conversation list
        const convIndex = state.conversations.findIndex(
          c => c.id === action.payload.conversation
        );
        if (convIndex !== -1) {
          state.conversations[convIndex].last_message = action.payload;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Mark Messages as Read
    builder
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.messages = state.messages.map(m => ({ ...m, is_read: true }));
      });
  },
});

export const { 
  addMessage, 
  clearMessages, 
  clearCurrentConversation, 
  clearMessagingError 
} = messagingSlice.actions;
export default messagingSlice.reducer;      
