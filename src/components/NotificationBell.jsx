import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const notifications = [
    { id: 1, text: "Order ORD_EXAMPLE approved" },
    { id: 2, text: "New order received" },
    { id: 3, text: "Invoice ready for download" },
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      
      {/* ICON */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
        <Bell className="w-5 h-5 text-gray-700 dark:text-white" />
        {/* BADGE */}
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-xl shadow-lg z-50">
          
          <div className="p-3 border-b dark:border-zinc-700 font-semibold text-sm">
            Notifications
          </div>

          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer">
                  {n.text}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;