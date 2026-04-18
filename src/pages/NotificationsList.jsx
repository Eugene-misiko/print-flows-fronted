import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, AlertCircle, Info, Check, CreditCard, Package } from "lucide-react";
import { fetchNotifications, markAsRead, markAllAsRead } from "@/store/slices/notificationsSlice";
import toast from "react-hot-toast";

const NotificationsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, isLoading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications()).unwrap().catch(() => toast.error("Failed to load notifications"));
  }, [dispatch]);

  const timeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Colors updated to fit the warm palette while keeping visual distinction
  const getIcon = (type) => {
    const map = {
      order: <Package className="h-5 w-5 text-[#c2410c] dark:text-[#ea580c]" />,
      payment: <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      design: <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      printing: <AlertCircle className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
      delivery: <CheckCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      system: <Info className="h-5 w-5 text-stone-500 dark:text-stone-500" />,
    };
    return map[type] || map.system;
  };

  const handleClick = (notif) => {
    if (notif.link) {
      navigate(notif.link);
    } else if (notif.related_object_type === "order" && notif.related_object_id) {
      navigate(`/app/orders/${notif.related_object_id}`);
    }
    if (!notif.is_read) dispatch(markAsRead(notif.id));
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Notifications</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 font-medium">
            {unreadCount > 0 ? (
              <span className="text-[#c2410c] dark:text-[#ea580c] font-bold">
                {unreadCount} unread</span>
            ) : (
              "All caught up"
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={async () => { 
              try { 
                await dispatch(markAllAsRead()).unwrap(); 
                toast.success("All marked as read"); 
              } catch { 
                toast.error("Failed to mark as read"); 
              } 
            }} 
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 active:scale-[.98] transition-all shadow-sm"
          >
            <Check className="h-4 w-4 text-[#c2410c]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden shadow-sm shadow-stone-200/30 dark:shadow-black/10 transition-colors duration-300">
        
        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="p-6 space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-10 w-10 bg-stone-200 dark:bg-stone-700 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-lg w-3/4" />
                  <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications?.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => handleClick(notif)} 
              className={`p-4 sm:p-5 transition-colors cursor-pointer group ${
                !notif.is_read 
                  ? "bg-[#fff7ed] dark:bg-[#c2410c]/5 hover:bg-orange-50 dark:hover:bg-[#c2410c]/10" 
                  : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center">
                  {getIcon(notif.notification_type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-semibold leading-snug ${
                      !notif.is_read 
                        ? "text-stone-900 dark:text-stone-100" 
                        : "text-stone-600 dark:text-stone-400"
                    }`}>
                      {notif.title}
                    </p>
                    {/* Unread Dot */}
                    {!notif.is_read && (
                      <span className="w-2.5 h-2.5 bg-[#c2410c] rounded-full flex-shrink-0 mt-1.5 shadow-sm shadow-[#c2410c]/30" />
                    )}
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-600 mt-2.5 font-medium tabular-nums">
                    {timeAgo(notif.created_at)}
                  </p>
                </div>

                {/* Mark as Read Button */}
                {!notif.is_read && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      dispatch(markAsRead(notif.id)); 
                    }} 
                    className="flex-shrink-0 p-2 text-stone-400 dark:text-stone-600 hover:text-[#c2410c] dark:hover:text-[#ea580c] hover:bg-white dark:hover:bg-stone-800 rounded-xl transition-colors opacity-0 group-hover:opacity-100" 
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mx-auto mb-5">
              <Bell className="h-9 w-9 text-stone-300 dark:text-stone-600" />
            </div>
            <p className="font-semibold text-stone-600 dark:text-stone-400">No notifications</p>
            <p className="text-sm text-stone-400 dark:text-stone-600 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;