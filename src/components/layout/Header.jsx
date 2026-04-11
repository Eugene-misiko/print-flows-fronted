import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMobileSidebarOpen } from "../../store/slices/uiSlice";
import { Link } from "react-router-dom";
import {
  Bell,
  User,
  Shield,
  Palette,
  Printer as PrinterIcon,
  Menu,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // This correctly hooks into your Redux slice to show the live badge count
  const { unreadCount } = useSelector((state) => state.notifications);

  const openMobileSidebar = () => {
    dispatch(setMobileSidebarOpen(true));
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return <Shield className="w-3.5 h-3.5" />;
      case "designer":
        return <Palette className="w-3.5 h-3.5" />;
      case "printer":
        return <PrinterIcon className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30";
      case "designer":
        return "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-800/30";
      case "printer":
        return "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800/30";
      default:
        return "bg-[#fff7ed] dark:bg-[#c2410c]/15 text-[#c2410c] dark:text-[#ea580c] border border-[#c2410c]/10 dark:border-[#c2410c]/20";
    }
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/80 dark:bg-stone-950/80 backdrop-blur-2xl border-b border-stone-200/60 dark:border-stone-800/60 px-4 md:px-6 py-3.5 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Left Side: Menu & Welcome */}
        <div className="flex items-center gap-3">
          <button
            onClick={openMobileSidebar}
            className="lg:hidden p-2 -ml-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base md:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Welcome, {user?.first_name || "User"}
            </h1>
            <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 hidden sm:block">
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

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <button className="relative p-2.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors active:scale-95">
            <Link to="/app/notifications">
              <Bell className="w-[20px] h-[20px]" />
            </Link>
            {/* Live Badge from Redux */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#c2410c] text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none px-1 shadow-sm shadow-[#c2410c]/30">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-stone-200/60 dark:border-stone-700/60">
            <Link to="/app/profile" className="group">
              {/* Avatar */}
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-full flex items-center justify-center text-white font-bold shadow-sm shadow-orange-600/20 group-hover:shadow-md group-hover:shadow-orange-600/30 transition-shadow">
                {user?.first_name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            </Link>
            {/* Name & Role */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold mt-0.5 ${getRoleColor(
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