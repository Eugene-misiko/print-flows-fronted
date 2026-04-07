import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMobileSidebarOpen } from "../../store/slices/uiSlice";
import { Link } from "react-router-dom";
import {Bell,User,Shield,Palette,Printer as PrinterIcon,Menu,} from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const openMobileSidebar = () => {
    dispatch(setMobileSidebarOpen(true));
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return <Shield className="w-4 h-4" />;
      case "designer":
        return <Palette className="w-4 h-4" />;
      case "printer":
        return <PrinterIcon className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "designer":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
      case "printer":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      default:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3.5 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={openMobileSidebar}
            className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Welcome, {user?.first_name || "User"}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Link to="/notifications">
              <Bell className="w-5 h-5" />
            </Link>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200 dark:border-gray-700">
            <Link to="/profile">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {user?.first_name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            </Link>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                  user?.role
                )}`}
              >
                {getRoleIcon(user?.role)}
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;