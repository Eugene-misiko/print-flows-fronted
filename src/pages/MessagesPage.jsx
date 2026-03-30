import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, createConversation, fetchMessages, sendMessage } from "@/store/slices/messagingSlice";
import toast from "react-hot-toast";
import { MessageSquare, Send, Plus } from "lucide-react";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { conversations, messages, isLoading } = useSelector((state) => state.messaging);
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newConversation, setNewConversation] = useState({ subject: "" });

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConversation) {
      dispatch(fetchMessages({ conversationId: selectedConversation, params: {} }));
    }
  }, [dispatch, selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const result = await dispatch(sendMessage({
      conversation_id: selectedConversation,
      content: newMessage,
    }));
    
    if (sendMessage.fulfilled.match(result)) {
      setNewMessage("");
      dispatch(fetchMessages({ conversationId: selectedConversation, params: {} }));
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newConversation.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    
    const result = await dispatch(createConversation({
      subject: newConversation.subject,
    }));
    
    if (createConversation.fulfilled.match(result)) {
      toast.success("Conversation created");
      setShowNewModal(false);
      setSelectedConversation(result.payload.id);
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] flex gap-6">
      {/* Conversations List */}
      <div className="w-80 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Messages</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations?.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No conversations
            </div>
          ) : (
            conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedConversation === conv.id 
                    ? "bg-orange-50 dark:bg-orange-900/20 border-l-2 border-l-orange-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.last_message?.content || "No messages"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {conversations?.find(c => c.id === selectedConversation)?.subject}
              </h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    msg.is_mine
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 text-right ${
                      msg.is_mine 
                        ? "text-orange-100" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 bg-white dark:bg-gray-800">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-full shadow-sm transition-all duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <MessageSquare className="w-16 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">New Conversation</h3>
            </div>
            <form onSubmit={handleCreateConversation} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={newConversation.subject}
                  onChange={(e) => setNewConversation({ ...newConversation, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="Enter conversation subject"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;