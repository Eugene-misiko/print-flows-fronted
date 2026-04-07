import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchConversations,fetchMessages,sendMessage,startConversation,} from "@/store/slices/messagingSlice";
import { fetchUsers } from "@/store/slices/usersSlice";
import { fetchOrders } from "@/store/slices/ordersSlice";
import toast from "react-hot-toast";
import {MessageSquare,Send,Plus,Search,X,Package,FileText,ChevronDown,} from "lucide-react";

//Utilities
const fmtCurr = (a) => `KES ${(a || 0).toLocaleString()}`;
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDateLabel = (d) => {
  const date = new Date(d),
    today = new Date(),
    yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yest.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const fmtConvTime = (d) => {
  if (!d) return "";
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return fmtTime(d);
  if (days === 1) return "Yesterday";
  return days < 7
    ? new Date(d).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      })
    : new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
};

const groupByDate = (msgs) => {
  if (!msgs?.length) return [];
  const groups = [];
  let cur = null;
  for (const msg of msgs) {
    const d = new Date(msg.created_at).toLocaleDateString();
    if (d !== cur) {
      cur = d;
      groups.push({ date: d, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
};

const inputCls =
  "w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm";

//Reusable Avatar 
const Avatar = ({ name, size = "md" }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?";
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-10 h-10 text-sm",
  };
  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}
    >
      {initials}
    </div>
  );
};

// Message Bubble 
const MessageBubble = ({ msg, isMine, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const [isLong, setIsLong] = useState(false);

  useEffect(() => {
    if (contentRef.current) setIsLong(contentRef.current.scrollHeight > 120);
  }, [msg.content]);

  return (
    <div
      className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
        isMine
          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600"
      }`}
    >
      <div
        ref={contentRef}
        className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isLong && !expanded ? "max-h-[7.5em] overflow-hidden relative" : ""
        }`}
      >
        {msg.content}
        {isLong && !expanded && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none ${
              isMine
                ? "bg-gradient-to-t from-orange-600"
                : "bg-gradient-to-t from-white dark:from-gray-700"
            } to-transparent`}
          />
        )}
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1 mt-1 text-xs font-medium ${
            isMine
              ? "text-orange-100"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <span>{expanded ? "Show less" : "Show more"}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {msg.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {msg.attachments.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                isMine
                  ? "bg-white/15 text-orange-100"
                  : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>File</span>
            </a>
          ))}
        </div>
      )}

      <div
        className={`flex items-center justify-end gap-1.5 mt-1 ${
          isMine ? "text-orange-100" : "text-gray-400"
        }`}
      >
        {msg.is_edited && <span className="text-[10px] italic">edited</span>}
        {isLast && (
          <span className="text-[10px]">{fmtTime(msg.created_at)}</span>
        )}
      </div>
    </div>
  );
};

//Main Component 
const MessagesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { conversations, messages, isLoading } = useSelector(
    (s) => s.messaging
  );
  const { users } = useSelector((s) => s.users);
  const { orders } = useSelector((s) => s.orders);
  const messagesEndRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [recipSearch, setRecipSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [linkOrder, setLinkOrder] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchUsers());
    dispatch(fetchOrders({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedId) return;
    const poll = () =>
      dispatch(fetchMessages({ conversationId: selectedId, params: {} }));
    poll();
    const interval = setInterval(() => {
      if (!document.hidden) poll();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations?.find((c) => c.id === selectedId);
  const otherUser = selectedConv?.participants?.find((p) => p.id !== user?.id);
  const linkedOrder = selectedConv?.order
    ? orders?.find((o) => o.id === selectedConv.order)
    : null;

  const filteredUsers = users?.filter(
    (u) => u.id !== user?.id && u.is_active !== false && u.role !== "platform_admin"
  );
  const filteredRecips = filteredUsers?.filter((u) => {
    if (!recipSearch) return true;
    const q = recipSearch.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });
  const filteredOrders = orders?.filter((o) => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) || o.id?.toString().includes(q)
    );
  });
  const selectedRecipient = filteredUsers?.find(
    (u) => u.id === parseInt(recipientId)
  );
  const selectedOrder = orders?.find((o) => o.id === parseInt(orderId));

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    await dispatch(
      sendMessage({ conversation_id: selectedId, content: newMessage })
    );
    setNewMessage("");
  };

  const resetModal = () => {
    setShowModal(false);
    setRecipientId("");
    setOrderId("");
    setFirstMessage("");
    setRecipSearch("");
    setOrderSearch("");
    setLinkOrder(false);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!recipientId) return toast.error("Select a recipient");
    if (!firstMessage.trim()) return toast.error("Type a message");
    const data = { recipient_id: parseInt(recipientId), message: firstMessage };
    if (linkOrder && orderId) data.order_id = parseInt(orderId);
    const r = await dispatch(startConversation(data));
    if (startConversation.fulfilled.match(r)) {
      toast.success("Conversation started");
      resetModal();
      setSelectedId(r.payload.conversation.id);
      dispatch(fetchConversations());
    }
  };

  // Shared renderers (used by both mobile & desktop) 
  const renderMsgList = () => {
    if (!messages?.length)
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 opacity-40" />
          </div>
          <p className="text-sm font-medium">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Send a message to get started</p>
        </div>
      );
    return groupByDate(messages).map((g, gi) => (
      <React.Fragment key={g.date}>
        {gi > 0 && (
          <div className="flex items-center gap-3 my-5 px-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700/50" />
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-950 px-3 py-1 rounded-full">
              {fmtDateLabel(g.date)}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700/50" />
          </div>
        )}
        {g.messages.map((msg, mi) => {
          const isMine = msg.is_mine;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                mi === 0 ? "mt-2" : "mt-1"
              }`}
            >
              {!isMine && mi === 0 && (
                <div className="flex-shrink-0 mr-2 mt-1">
                  <Avatar name={msg.sender_name} size="sm" />
                </div>
              )}
              <MessageBubble
                msg={msg}
                isMine={isMine}
                isLast={mi === g.messages.length - 1}
              />
            </div>
          );
        })}
      </React.Fragment>
    ));
  };

  const renderChatHeader = (mobile) => (
    <div
      className={`bg-white dark:bg-gray-900 ${
        mobile ? "px-4 py-3" : "px-5 py-3.5"
      } border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shrink-0`}
    >
      {mobile && (
        <button
          onClick={() => setSelectedId(null)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
        >
          ←
        </button>
      )}
      <Avatar name={otherUser?.name} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {otherUser?.name || "User"}
        </p>
        {linkedOrder && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Package className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {linkedOrder.order_number}
              {!mobile && ` · ${fmtCurr(linkedOrder.total_price)}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderChatInput = (mobile) => (
    <form
      onSubmit={handleSend}
      className={`${
        mobile ? "px-4 py-3" : "px-5 py-4"
      } border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0`}
    >
      <div className={`flex ${mobile ? "gap-2" : "gap-2.5 items-end"}`}>
        {mobile ? (
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={inputCls}
          />
        ) : (
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm resize-none overflow-hidden"
            style={{ minHeight: "44px", maxHeight: "120px", height: "auto" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        )}
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className={`${
            mobile ? "p-2.5" : "p-3"
          } bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl ${
            mobile ? "" : "shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
          } transition-all shrink-0`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );

  const renderChatArea = (mobile) => (
    <div
      className={`flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 ${
        mobile ? "" : "hidden lg:flex"
      }`}
    >
      {selectedId && selectedConv ? (
        <>
          {renderChatHeader(mobile)}
          <div className={`flex-1 overflow-y-auto ${mobile ? "px-4" : "px-5"} py-4 space-y-1`}>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              renderMsgList()
            )}
            <div ref={messagesEndRef} />
          </div>
          {renderChatInput(mobile)}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
          <div
            className={`rounded-${
              mobile ? "2xl" : "3xl"
            } bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-${
              mobile ? "3" : "5"
            } ${mobile ? "w-16 h-16" : "w-24 h-24"}`}
          >
            <MessageSquare className={`${mobile ? "w-8 h-8" : "w-12 h-12"} opacity-30`} />
          </div>
          <p
            className={`${
              mobile ? "text-sm" : "text-lg"
            } font-semibold text-gray-600 dark:text-gray-300`}
          >
            {mobile ? "Select a conversation" : "Your Messages"}
          </p>
          {!mobile && (
            <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
              Select a conversation from the left or start a new one to begin
              messaging
            </p>
          )}
        </div>
      )}
    </div>
  );

  
  return (
    <div className="h-[calc(100vh-140px)] flex bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Conversation List */}
      <div
        className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 ${
          selectedId ? "hidden lg:flex lg:w-80" : "w-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
            Messages
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors group"
            title="New conversation"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !conversations?.length ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Click + to start one</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find((p) => p.id !== user?.id);
              const convOrder = conv.order
                ? orders?.find((o) => o.id === conv.order)
                : null;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-100 dark:border-gray-800/50 transition-all ${
                    conv.id === selectedId
                      ? "bg-orange-50 dark:bg-orange-900/20 border-l-[3px] border-l-orange-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-[3px] border-l-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={other?.name || other?.email} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {other?.name || "User"}
                        </p>
                        {convOrder && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-medium flex items-center gap-1 shrink-0">
                            <Package className="w-2.5 h-2.5" />
                            {convOrder.order_number}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                          {conv.last_message || "Start a conversation..."}
                        </p>
                        {conv.last_message_at && (
                          <p className="text-[10px] text-gray-400 shrink-0">
                            {fmtConvTime(conv.last_message_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Desktop Chat */}
      {renderChatArea(false)}
      {/* Mobile Chat (only when a conversation is selected) */}
      {selectedId && selectedConv && renderChatArea(true)}

      {/*New Conversation Modal*/}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    New Conversation
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Start messaging someone
                  </p>
                </div>
              </div>
              <button
                onClick={resetModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleStart}
              className="flex flex-col flex-1 min-h-0 overflow-y-auto"
            >
              <div className="p-6 space-y-4 flex-1">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Recipient <span className="text-red-500">*</span>
                  </label>
                  {selectedRecipient && !recipSearch ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                      <Avatar
                        name={`${selectedRecipient.first_name} ${selectedRecipient.last_name}`}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedRecipient.first_name}{" "}
                          {selectedRecipient.last_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedRecipient.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecipientId("")}
                        className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={recipSearch}
                          onChange={(e) => setRecipSearch(e.target.value)}
                          placeholder="Search by name or email..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 mt-1.5">
                        {!filteredRecips?.length ? (
                          <p className="text-sm text-gray-400 text-center py-4">
                            No users found
                          </p>
                        ) : (
                          filteredRecips.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setRecipientId(u.id);
                                setRecipSearch("");
                              }}
                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-xl last:rounded-b-xl"
                            >
                              <Avatar
                                name={`${u.first_name} ${u.last_name}`}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {u.first_name} {u.last_name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Link Order Toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={linkOrder}
                      onChange={(e) => {
                        setLinkOrder(e.target.checked);
                        if (!e.target.checked) setOrderId("");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-orange-500 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Link to an order
                  </span>
                </label>

                {/* Order Selector */}
                {linkOrder && (
                  <div>
                    {selectedOrder && !orderSearch ? (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <Package className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedOrder.order_number}
                          </p>
                          <p className="text-xs text-gray-400">
                            {fmtCurr(selectedOrder.total_price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderId("")}
                          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            placeholder="Search orders..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          />
                        </div>
                        <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 mt-1.5">
                          {!filteredOrders?.length ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                              No orders found
                            </p>
                          ) : (
                            filteredOrders.map((o) => (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => {
                                  setOrderId(o.id.toString());
                                  setOrderSearch("");
                                }}
                                className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-xl last:rounded-b-xl"
                              >
                                <Package className="w-4 h-4 text-gray-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {o.order_number}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {fmtCurr(o.total_price)}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* First Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    rows={3}
                    placeholder="Write your first message..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
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