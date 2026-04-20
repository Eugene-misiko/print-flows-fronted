import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchConversations,fetchMessages,sendMessage,startConversation,} from "@/store/slices/messagingSlice";
import { fetchUsers } from "@/store/slices/usersSlice";
import { fetchOrders } from "@/store/slices/ordersSlice";
import toast from "react-hot-toast";
import { MessageSquare, Send,Plus,Search,X,Package,FileText,ChevronDown,
  ArrowLeft,
  Image,
  Paperclip,
} from "lucide-react";

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */
const fmtCurr = (a) => `KES ${(a || 0).toLocaleString()}`;
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDateLabel = (d) => {
  const date = new Date(d);
  const today = new Date();
  const yest = new Date(today);
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
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  if (hrs < 24 && days === 0) return fmtTime(d);
  if (days === 1) return "Yesterday";
  if (days < 7)
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    });
  return new Date(d).toLocaleDateString("en-US", {
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

/* ═══════════════════════════════════════════
   AVATAR
   ═══════════════════════════════════════════ */
const Avatar = ({ name, size = "md", ring = false, online = false }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?";
  const sizes = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-14 h-14 text-base",
  };
  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-full flex items-center justify-center text-white font-bold transition-transform duration-200 ${
          ring
            ? "ring-2 ring-[#faf9f6] dark:ring-stone-950 ring-offset-0"
            : "shadow-sm shadow-orange-600/15"
        }`}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#faf9f6] dark:border-stone-950 rounded-full" />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MESSAGE BUBBLE
   ═══════════════════════════════════════════ */
const MessageBubble = ({ msg, isMine, showAvatar, showName, senderName }) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const [isLong, setIsLong] = useState(false);

  useEffect(() => {
    if (contentRef.current) setIsLong(contentRef.current.scrollHeight > 120);
  }, [msg.content]);

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2 ${
        isMine ? "msg-mine" : "msg-theirs"
      }`}
    >
      {/* Spacer for avatar alignment */}
      {!isMine && (
        <div className="w-8 shrink-0 flex flex-col items-center">
          {showAvatar && <Avatar name={senderName} size="xs" />}
        </div>
      )}

      <div className="max-w-[75%] min-w-0">
        {/* Sender name for group context */}
        {showName && !isMine && (
          <p className="text-[11px] font-semibold text-[#c2410c] dark:text-[#ea580c] mb-1 ml-1">
            {senderName}
          </p>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl transition-shadow duration-200 hover:shadow-md ${
            isMine
              ? "bg-gradient-to-br from-[#c2410c] to-[#ea580c] text-white rounded-br-lg shadow-sm shadow-orange-600/10"
              : "bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200/70 dark:border-stone-700 rounded-bl-lg shadow-sm shadow-stone-200/30 dark:shadow-black/10"
          }`}
        >
          <div
            ref={contentRef}
            className={`text-[13.5px] leading-relaxed whitespace-pre-wrap break-words ${
              isLong && !expanded
                ? "max-h-[7.5em] overflow-hidden relative"
                : ""
            }`}
          >
            {msg.content}
            {isLong && !expanded && (
              <div
                className={`absolute bottom-0 left-0 right-0 h-10 pointer-events-none ${
                  isMine
                    ? "bg-gradient-to-t from-[#c2410c] to-transparent"
                    : "bg-gradient-to-t from-white dark:from-stone-800 to-transparent"
                }`}
              />
            )}
          </div>

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1 mt-1 text-[11px] font-semibold transition-colors ${
                isMine
                  ? "text-orange-100/70 hover:text-orange-100"
                  : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
              }`}
            >
              <span>{expanded ? "Show less" : "Read more"}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {/* Attachments */}
          {msg.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {msg.attachments.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                    isMine
                      ? "bg-white/15 text-orange-100 hover:bg-white/25"
                      : "bg-stone-50 dark:bg-stone-700 text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-100 dark:border-stone-600"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  File
                </a>
              ))}
            </div>
          )}

          {/* Time & edited */}
          <div
            className={`flex items-center justify-end gap-1.5 mt-1 ${
              isMine ? "text-orange-200/50" : "text-stone-400 dark:text-stone-500"
            }`}
          >
            {msg.is_edited && (
              <span className="text-[10px] italic opacity-70">edited</span>
            )}
            <span className="text-[10px] tabular-nums">
              {fmtTime(msg.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Spacer for avatar alignment on mine side */}
      {isMine && <div className="w-8 shrink-0" />}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const MessagesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { conversations, messages, isLoading } = useSelector((s) => s.messaging);
  const { users } = useSelector((s) => s.users);
  const { orders } = useSelector((s) => s.orders);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [recipSearch, setRecipSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [linkOrder, setLinkOrder] = useState(false);
  const [convSearch, setConvSearch] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchUsers());
    dispatch(fetchOrders({ limit: 100 }));
  }, [dispatch]);

  // Polling for messages
  useEffect(() => {
    if (!selectedId) return;
    const poll = () =>
      dispatch(fetchMessages({ conversationId: selectedId, params: {} }));
    poll();
    const interval = setInterval(() => {
      if (!document.hidden) poll();
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedId, dispatch]);

  // Auto-scroll
  useEffect(() => {
    if (!messages?.length) return;
    const container = chatContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Derived
  const selectedConv = conversations?.find((c) => c.id === selectedId);
  const otherUser = selectedConv?.participants?.find((p) => p.id !== user?.id);
  const linkedOrder = selectedConv?.order
    ? orders?.find((o) => o.id === selectedConv.order)
    : null;
  const filteredUsers = users?.filter(
    (u) =>
      u.id !== user?.id &&
      u.is_active !== false &&
      u.role !== "platform_admin"
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
      o.order_number?.toLowerCase().includes(q) ||
      o.id?.toString().includes(q)
    );
  });
  const filteredConvs = conversations?.filter((c) => {
    if (!convSearch) return true;
    const q = convSearch.toLowerCase();
    const other = c.participants?.find((p) => p.id !== user?.id);
    return (
      other?.name?.toLowerCase().includes(q) ||
      other?.email?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });
  const selectedRecipient = filteredUsers?.find(
    (u) => u.id === parseInt(recipientId)
  );
  const selectedOrder = orders?.find((o) => o.id === parseInt(orderId));

  // Handlers
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    await dispatch(
      sendMessage({ conversation_id: selectedId, content: newMessage })
    );
    setNewMessage("");
    setIsSending(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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
    const data = {
      recipient_id: parseInt(recipientId),
      message: firstMessage,
    };
    if (linkOrder && orderId) data.order_id = parseInt(orderId);
    const r = await dispatch(startConversation(data));
    if (startConversation.fulfilled.match(r)) {
      toast.success("Conversation started");
      resetModal();
      setSelectedId(r.payload.conversation.id);
      dispatch(fetchConversations());
    }
  };

  const selectConv = useCallback(
    (id) => {
      setSelectedId(id);
      setNewMessage("");
    },
    []
  );

  /* ═══════════════════════════════════════════
     RENDER: Empty chat
     ═══════════════════════════════════════════ */
  const renderEmptyChat = (mobile) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#faf9f6] dark:bg-stone-950">
      <div
        className={`flex items-center justify-center bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 shadow-sm shadow-stone-200/30 dark:shadow-black/10 ${
          mobile
            ? "w-16 h-16 rounded-2xl mb-4"
            : "w-24 h-24 rounded-3xl mb-6"
        }`}
      >
        <MessageSquare
          className={`${mobile ? "w-7 h-7" : "w-10 h-10"} text-stone-300 dark:text-stone-600`}
        />
      </div>
      <p
        className={`font-bold text-stone-500 dark:text-stone-400 ${
          mobile ? "text-sm" : "text-lg"
        }`}
      >
        {mobile ? "Select a chat" : "Your Messages"}
      </p>
      {!mobile && (
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-2 max-w-xs text-center leading-relaxed">
          Pick a conversation from the sidebar or start a new one to begin
          messaging.
        </p>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════
     RENDER: Message list
     ═══════════════════════════════════════════ */
  const renderMsgList = () => {
    if (!messages?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-500">
          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 shadow-sm flex items-center justify-center mb-4">
            <MessageSquare className="w-9 h-9 opacity-30" />
          </div>
          <p className="text-sm font-bold text-stone-500 dark:text-stone-400">
            No messages yet
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">
            Send a message to get started
          </p>
        </div>
      );
    }

    return groupByDate(messages).map((g, gi) => (
      <React.Fragment key={g.date}>
        {/* Date separator */}
        {gi > 0 && (
          <div className="flex items-center gap-3 my-6 px-2">
            <div className="flex-1 h-px bg-stone-200/60 dark:bg-stone-700/60" />
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold tracking-wider uppercase bg-[#faf9f6] dark:bg-stone-950 px-3.5 py-1 rounded-full border border-stone-100 dark:border-stone-700">
              {fmtDateLabel(g.date)}
            </span>
            <div className="flex-1 h-px bg-stone-200/60 dark:bg-stone-700/60" />
          </div>
        )}

        {g.messages.map((msg, mi) => {
          const isMine = msg.is_mine;
          const prevMsg = mi > 0 ? g.messages[mi - 1] : null;
          const showAvatar =
            !isMine &&
            (!prevMsg || prevMsg.is_mine || prevMsg.sender_id !== msg.sender_id);
          const showName =
            !isMine &&
            mi === 0 &&
            (!prevMsg || prevMsg.sender_id !== msg.sender_id);

          return (
            <div key={msg.id} className={mi === 0 ? "mt-2" : "mt-1"}>
              <MessageBubble
                msg={msg}
                isMine={isMine}
                showAvatar={showAvatar}
                showName={showName}
                senderName={msg.sender_name}
              />
            </div>
          );
        })}
      </React.Fragment>
    ));
  };

  /* ═══════════════════════════════════════════
     RENDER: Chat header
     ═══════════════════════════════════════════ */
  const renderChatHeader = (mobile) => (
    <div
      className={`bg-[#faf9f6]/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200/60 dark:border-stone-800/60 flex items-center gap-3 shrink-0 ${
        mobile ? "px-4 py-3" : "px-6 py-4"
      }`}
    >
      {mobile && (
        <button
          onClick={() => setSelectedId(null)}
          className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
        </button>
      )}
      <Avatar name={otherUser?.name} size="lg" online />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
          {otherUser?.name || "User"}
        </p>
        {linkedOrder ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Package className="w-3 h-3 text-[#c2410c]" />
            <span className="text-[11px] text-[#c2410c] font-bold">
              {linkedOrder.order_number}
              {!mobile && ` · ${fmtCurr(linkedOrder.total_price)}`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
              Active
            </span>
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
     RENDER: Chat input
     ═══════════════════════════════════════════ */
  const renderChatInput = (mobile) => (
    <form
      onSubmit={handleSend}
      className={`border-t border-stone-200/60 dark:border-stone-800/60 bg-[#faf9f6]/90 dark:bg-stone-950/90 backdrop-blur-xl shrink-0 ${
        mobile ? "px-4 py-3" : "px-6 py-4"
      }`}
    >
      <div className={`flex ${mobile ? "gap-2" : "gap-3 items-end"}`}>
        {/* Attachment button (visual only) */}
        <button
          type="button"
          className={`shrink-0 p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-200 active:scale-95 hidden sm:flex items-center justify-center`}
          title="Attach file"
        >
          <Paperclip className="w-[18px] h-[18px]" />
        </button>

        {mobile ? (
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all"
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all resize-none overflow-hidden"
            style={{ minHeight: "46px", maxHeight: "120px", height: "auto" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(
                e.target.scrollHeight,
                120
              )}px`;
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
          disabled={!newMessage.trim() || isSending}
          className={`${
            mobile ? "p-3" : "p-3.5"
          } rounded-xl transition-all duration-200 shrink-0 ${
            newMessage.trim() && !isSending
              ? "bg-gradient-to-br from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20 dark:shadow-orange-900/30 hover:shadow-orange-600/30 hover:from-[#92400e] hover:to-[#c2410c] active:scale-95"
              : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"
          }`}
        >
          {isSending ? (
            <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
    </form>
  );

  /* ═══════════════════════════════════════════
     RENDER: Chat area
     ═══════════════════════════════════════════ */
  const renderChatArea = (mobile) => (
    <div
      className={`flex-1 flex flex-col min-w-0 bg-[#faf9f6] dark:bg-stone-950 transition-all duration-300 ${
        mobile ? "lg:hidden" : "hidden lg:flex"
      }`}
    >
      {selectedId && selectedConv ? (
        <>
          {renderChatHeader(mobile)}
          <div
            ref={chatContainerRef}
            className={`flex-1 overflow-y-auto scrollbar-thin ${
              mobile ? "px-4" : "px-6"
            } py-5`}
          >
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              renderMsgList()
            )}
            <div ref={messagesEndRef} />
          </div>
          {renderChatInput(mobile)}
        </>
      ) : (
        renderEmptyChat(mobile)
      )}
    </div>
  );

  /* ═══════════════════════════════════════════
     RENDER: Conversation list item
     ═══════════════════════════════════════════ */
  const renderConvItem = (conv) => {
    const other = conv.participants?.find((p) => p.id !== user?.id);
    const convOrder = conv.order
      ? orders?.find((o) => o.id === conv.order)
      : null;
    const isActive = conv.id === selectedId;

    return (
      <button
        key={conv.id}
        onClick={() => selectConv(conv.id)}
        className={`w-full text-left px-4 sm:px-5 py-4 border-b border-stone-50 dark:border-stone-800/50 transition-all duration-200 group ${
          isActive
            ? "bg-[#fff7ed] dark:bg-[#c2410c]/10 border-l-[3px] border-l-[#c2410c]"
            : "border-l-[3px] border-l-transparent hover:bg-stone-50/80 dark:hover:bg-stone-800/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar name={other?.name || other?.email} ring={isActive} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-sm truncate transition-colors ${
                  isActive
                    ? "font-bold text-[#c2410c] dark:text-[#ea580c]"
                    : "font-semibold text-stone-800 dark:text-stone-200"
                }`}
              >
                {other?.name || "User"}
              </p>
              {conv.last_message_at && (
                <p
                  className={`text-[10px] tabular-nums shrink-0 font-medium ${
                    isActive
                      ? "text-[#c2410c]/60 dark:text-[#ea580c]/60"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {fmtConvTime(conv.last_message_at)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {convOrder && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] dark:text-[#ea580c] rounded-md font-bold shrink-0 border border-[#c2410c]/10 dark:border-[#c2410c]/20">
                  <Package className="w-2.5 h-2.5" />
                  {convOrder.order_number}
                </span>
              )}
              <p className="text-xs text-stone-400 dark:text-stone-500 truncate flex-1">
                {conv.last_message || "Start a conversation..."}
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  };

  /* ═══════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════ */
  return (
    <div
      className="h-[calc(100vh-140px)] flex bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/70 dark:border-stone-800 shadow-sm shadow-stone-200/40 dark:shadow-black/20 transition-colors duration-300"
      style={{
        opacity: 0,
        transform: "translateY(12px)",
        animation:
          "pageIn 0.5s 0ms cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      {/* ═══ SIDEBAR ═══ */}
      <div
        className={`flex-shrink-0 border-r border-stone-200/70 dark:border-stone-800 flex flex-col bg-[#faf9f6] dark:bg-stone-950 transition-all duration-300 ${
          selectedId
            ? "hidden lg:flex lg:w-80 xl:w-[340px]"
            : "w-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Messages
              </h2>
              {conversations?.length > 0 && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 font-medium">
                  {conversations.length} conversation
                  {conversations.length !== 1 && "s"}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 border border-stone-200/60 dark:border-stone-700 hover:border-[#c2410c]/20 flex items-center justify-center transition-all duration-200 group active:scale-95 shadow-sm hover:shadow-md"
              title="New conversation"
            >
              <Plus className="w-4 h-4 text-stone-500 dark:text-stone-400 group-hover:text-[#c2410c] dark:group-hover:text-[#ea580c] transition-colors" />
            </button>
          </div>

          {/* Search conversations */}
          {conversations?.length > 3 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs outline-none focus:border-[#c2410c]/30 focus:ring-2 focus:ring-[#c2410c]/5 transition-all"
              />
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !conversations?.length ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 shadow-sm flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400">
                No conversations yet
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">
                Tap the + button to start one
              </p>
            </div>
          ) : !filteredConvs?.length ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-stone-400 dark:text-stone-500">
                No matches found
              </p>
            </div>
          ) : (
            filteredConvs.map(renderConvItem)
          )}
        </div>
      </div>

      {/* Desktop chat area */}
      {renderChatArea(false)}

      {/* Mobile chat area */}
      {selectedId && selectedConv && renderChatArea(true)}

      {/* ═══ NEW CONVERSATION MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-anim">
          <div
            className="absolute inset-0 bg-[#1c1917]/50 dark:bg-black/60 backdrop-blur-md"
            onClick={resetModal}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl shadow-stone-900/10 dark:shadow-black/40 border border-stone-200/60 dark:border-stone-700 overflow-hidden flex flex-col max-h-[90vh] modal-anim">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-30 dark:opacity-15 scale-110" />
                  <div className="relative w-11 h-11 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20 dark:shadow-orange-600/10">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                    New Conversation
                  </h3>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    Start messaging someone
                  </p>
                </div>
              </div>
              <button
                onClick={resetModal}
                className="w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-100 dark:border-stone-700 flex items-center justify-center transition-all duration-200 active:scale-95"
              >
                <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              </button>
            </div>

            {/* Modal body */}
            <form
              onSubmit={handleStart}
              className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-thin"
            >
              <div className="p-6 space-y-5 flex-1">
                {/* Recipient */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                    Recipient <span className="text-[#c2410c]">*</span>
                  </label>
                  {selectedRecipient && !recipSearch ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#fff7ed] dark:bg-[#c2410c]/10 border border-[#c2410c]/15 dark:border-[#c2410c]/20 rounded-xl">
                      <Avatar
                        name={`${selectedRecipient.first_name} ${selectedRecipient.last_name}`}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
                          {selectedRecipient.first_name}{" "}
                          {selectedRecipient.last_name}
                        </p>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                          {selectedRecipient.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecipientId("")}
                        className="w-6 h-6 rounded-lg bg-[#c2410c]/10 hover:bg-[#c2410c]/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-[#c2410c]" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                        <input
                          type="text"
                          value={recipSearch}
                          onChange={(e) => setRecipSearch(e.target.value)}
                          placeholder="Search by name or email..."
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all"
                        />
                      </div>
                      {recipSearch && (
                        <div className="max-h-36 overflow-y-auto scrollbar-thin border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 mt-2 shadow-sm">
                          {!filteredRecips?.length ? (
                            <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-6">
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
                                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                              >
                                <Avatar
                                  name={`${u.first_name} ${u.last_name}`}
                                  size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                                    {u.first_name} {u.last_name}
                                  </p>
                                  <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                                    {u.email}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Link order toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none group">
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
                    <div className="w-10 h-[22px] bg-stone-200 dark:bg-stone-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#c2410c] peer-checked:to-[#ea580c] transition-colors duration-300" />
                    <div className="absolute left-[3px] top-[3px] w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-[18px] transition-transform duration-300" />
                  </div>
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300 group-hover:text-stone-800 dark:group-hover:text-stone-100 transition-colors">
                    Link to an order
                  </span>
                </label>

                {/* Order search */}
                {linkOrder && (
                  <div className="anim-su">
                    {selectedOrder && !orderSearch ? (
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#fff7ed] dark:bg-[#c2410c]/10 border border-[#c2410c]/15 dark:border-[#c2410c]/20 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-[#c2410c]/10 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-[#c2410c]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                            {selectedOrder.order_number}
                          </p>
                          <p className="text-[11px] text-stone-400 dark:text-stone-500">
                            {fmtCurr(selectedOrder.total_price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderId("")}
                          className="w-6 h-6 rounded-lg bg-[#c2410c]/10 hover:bg-[#c2410c]/20 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3 text-[#c2410c]" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                          <input
                            type="text"
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            placeholder="Search orders..."
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all"
                          />
                        </div>
                        {orderSearch && (
                          <div className="max-h-32 overflow-y-auto scrollbar-thin border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 mt-2 shadow-sm">
                            {!filteredOrders?.length ? (
                              <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-6">
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
                                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-100 dark:border-stone-600 flex items-center justify-center shrink-0">
                                    <Package className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                                      {o.order_number}
                                    </p>
                                    <p className="text-[11px] text-stone-400 dark:text-stone-500">
                                      {fmtCurr(o.total_price)}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* First message */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                    Message <span className="text-[#c2410c]">*</span>
                  </label>
                  <textarea
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    rows={3}
                    placeholder="Write your first message..."
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 font-semibold transition-all text-sm active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 dark:shadow-orange-900/30 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ═══ STYLES ═══ */}
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes msg-in-mine {
          from { opacity: 0; transform: translateX(16px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes msg-in-theirs {
          from { opacity: 0; transform: translateX(-16px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-su { animation: slide-up 0.55s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .anim-fi { animation: fade-in 0.35s ease forwards; opacity: 0; }
        .msg-mine { animation: msg-in-mine 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .msg-theirs { animation: msg-in-theirs 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .modal-anim { animation: modal-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .overlay-anim { animation: overlay-in 0.25s ease forwards; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 99px; }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #44403c; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #57534e; }
      `}</style>
    </div>
  );
};

export default MessagesPage;