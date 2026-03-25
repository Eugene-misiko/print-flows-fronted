import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCircle, AlertCircle, Info, Check } from "lucide-react";
import { fetchNotifications, markAsRead, markAllAsRead } from "@/store/slices/notificationsSlice";
import toast from "react-hot-toast";

const NotificationsList = () => {
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notifications);

useEffect(() => {
  dispatch(fetchNotifications())
    .unwrap()
    .catch(() => toast.error("Failed to load notifications"));
}, [dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "payment":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "design":
        return <Info className="h-5 w-5 text-purple-600" />;
      case "printing":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "delivery":
        return <CheckCircle className="h-5 w-5 text-indigo-600" />;
      case "system":
        return <Info className="h-5 w-5 text-gray-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <>
  
   
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your activity</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center px-4 py-2 border  border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-black">
          <Check className="h-4 w-4 mr-2 hover:text-black" />
          <p className="text-white cursor-pointer hover:text-black">Mark all as read</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.is_read ? "bg-orange-50" : ""
              }`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {getIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default NotificationsList;
