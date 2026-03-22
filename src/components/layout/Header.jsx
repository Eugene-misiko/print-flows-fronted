import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bell, MessageSquare, Search, Menu } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleMobileSidebar } from "@/store/slices/uiSlice";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 ${
        sidebarOpen ? "left-64" : "left-20"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Messages */}
          <Link
            to="/messages"
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 ml-2 p-1 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-medium text-sm">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.full_name?.split(" ")[0] || "User"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;