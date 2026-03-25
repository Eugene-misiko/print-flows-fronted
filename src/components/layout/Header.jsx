import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { Link } from "react-router-dom";
import { Bell, LogOut, User, Shield, Palette, Printer as PrinterIcon } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

// Roles are LOWERCASE: 'admin', 'designer', 'printer', 'client', 'platform_admin'
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
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
        return "bg-purple-100 text-purple-700";
      case "designer":
        return "bg-pink-100 text-pink-700";
      case "printer":
        return "bg-cyan-100 text-cyan-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    return role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 dark:text-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-lg text-white font-semibold text-gray-900 dark:text-white">
            Welcome, {user?.first_name || "User"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/60">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "numeric"})}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <ThemeToggle/>
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Link to="/notifications">
            <Bell className="w-5 h-5" />
            </Link>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          
          {/* User Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <Link to="/profile">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
              
              {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            </Link>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 text-white/60">
                {user?.first_name} {user?.last_name} 
              </p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                {getRoleIcon(user?.role)}
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:bg-gray-100 cursor-pointer hover:text-red-600 rounded-lg transition-colors"
            title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
