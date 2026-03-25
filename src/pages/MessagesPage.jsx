import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, createConversation, fetchMessages, sendMessage } from "@/store/slices/messagingSlice";
import toast from "react-hot-toast";
import { MessageSquare, Send, Plus, User } from "lucide-react";

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

    <div className="h-[calc(100vh-150px)] flex gap-4">
      {/* Conversations List */}
      <div className="w-80 shadow-sm border flex flex-col 
   bg-gradient-to-r 
  from-gray-800 
  via-gray-700 
  to-gray-600 
  dark:from-gray-900 
  dark:via-gray-800 
  dark:to-gray-700
  text-white
  rounded-2xl 
  p-6 
  shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Messages</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-white dark:hover:text-black cursor-pointer" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations?.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm dark:text-white/60">No conversations</div>
          ) : (
            conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left border-b hover:bg-gray-50 ${selectedConversation === conv.id ? "bg-orange-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{conv.subject}</p>
                    <p className="text-xs text-gray-500 truncate">
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
      <div className="flex-1 bg-white rounded-xl shadow-sm border flex flex-col   bg-gradient-to-r 
  from-gray-800 
  via-gray-700 
  to-gray-600 
  dark:from-gray-900 
  dark:via-gray-800 
  dark:to-gray-700
  text-white
  rounded-2xl 
  p-6 
  shadow-lg">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 ">
                {conversations?.find(c => c.id === selectedConversation)?.subject}
              </h3>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.is_mine
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.is_mine ? "text-orange-100" : "text-gray-500"}`}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 ">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="dark:text-white/60">Select a conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
          <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">New Conversation</h3>
            <form onSubmit={handleCreateConversation} className="space-y-4 ">
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newConversation.subject}
                  onChange={(e) => setNewConversation({ ...newConversation, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Conversation subject"
                />
              </div>
              <div className="flex gap-3 ">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer px-4 py-2 bg-orange-500 text-white rounded-lg">
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