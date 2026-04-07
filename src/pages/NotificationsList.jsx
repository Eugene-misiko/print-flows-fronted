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

  const getIcon = (type) => {
    const map = {
      order: <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      payment: <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />,
      design: <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      printing: <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
      delivery: <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      system: <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />,
    };
    return map[type] || map.system;
  };

  const handleClick = (notif) => {
    if (notif.link) {
      navigate(notif.link);
    } else if (notif.related_object_type === "order" && notif.related_object_id) {
      navigate(`/orders/${notif.related_object_id}`);
    }
    if (!notif.is_read) dispatch(markAsRead(notif.id));
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={async () => { try { await dispatch(markAllAsRead()).unwrap(); toast.success("All marked as read"); } catch { toast.error("Failed"); } }} className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"><Check className="h-4 w-4 mr-2" />Mark all as read</button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse flex gap-4"><div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div></div>)}</div>
        ) : notifications?.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} onClick={() => handleClick(notif)} className={`p-4 transition-colors cursor-pointer ${!notif.is_read ? "bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(notif.notification_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium ${!notif.is_read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>{notif.title}</p>
                    {!notif.is_read && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{timeAgo(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <button onClick={(e) => { e.stopPropagation(); dispatch(markAsRead(notif.id)); }} 
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600
                   dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-600 
                   rounded-full" title="Mark as read">
                    <Check className="h-4 w-4" />
                    </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No notifications</p></div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;