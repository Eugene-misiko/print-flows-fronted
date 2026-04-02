import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Bell,
  FileText,
  Palette,
  Printer,
  X,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { setMobileSidebarOpen } from "../../store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";

const MobileSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mobileSidebarOpen } = useSelector((state) => state.ui);
  const { unreadCount } = useSelector((state) => state.notifications);

  const isAdmin =
    user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter = user?.role === "printer";
  const isClient = user?.role === "client";

  const getRoleBasedMenu = () => {
    const commonItems = [
      { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/orders", icon: ShoppingCart, label: "Orders" },
      { path: "/messages", icon: MessageSquare, label: "Messages" },
      {
        path: "/notifications",
        icon: Bell,
        label: "Notifications",
        badge: unreadCount,
      },
    ];

    switch (user?.role) {
      case "admin":
      case "platform_admin":
        return [
          ...commonItems,
          { path: "/orders/new", icon: PlusCircle, label: "New Order" },
          { path: "/products", icon: Package, label: "Products" },
          { path: "/users", icon: Users, label: "Team" },
          { path: "/payments", icon: CreditCard, label: "Payments" },
          { path: "/invoices", icon: FileText, label: "Invoices" },
          { path: "/settings", icon: Settings, label: "Settings" },
        ];
      case "designer":
        return [
          { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { path: "/design-tasks", icon: Palette, label: "Design Tasks" },
          { path: "/orders", icon: ShoppingCart, label: "Orders" },
          { path: "/invoices", icon: FileText, label: "Invoices" },
          { path: "/payments", icon: CreditCard, label: "Payments" },
          { path: "/messages", icon: MessageSquare, label: "Messages" },
          {
            path: "/notifications",
            icon: Bell,
            label: "Notifications",
            badge: unreadCount,
          },
        ];
      case "printer":
        return [
          { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { path: "/print-jobs", icon: Printer, label: "Print Jobs" },
          { path: "/orders", icon: ShoppingCart, label: "Orders" },
          { path: "/invoices", icon: FileText, label: "Invoices" },
          { path: "/payments", icon: CreditCard, label: "Payments" },
          { path: "/messages", icon: MessageSquare, label: "Messages" },
          {
            path: "/notifications",
            icon: Bell,
            label: "Notifications",
            badge: unreadCount,
          },
        ];
      case "client":
        return [
          { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { path: "/orders", icon: ShoppingCart, label: "My Orders" },
          { path: "/orders/new", icon: PlusCircle, label: "New Order" },
          { path: "/products", icon: Package, label: "Products" },
          { path: "/payments", icon: CreditCard, label: "Payments" },
          { path: "/messages", icon: MessageSquare, label: "Messages" },
          {
            path: "/notifications",
            icon: Bell,
            label: "Notifications",
            badge: unreadCount,
          },
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getRoleBasedMenu();

  const handleClose = () => {
    dispatch(setMobileSidebarOpen(false));
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  if (!mobileSidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        onClick={handleClose}
      />
      <aside
        className="fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900 shadow-2xl lg:hidden flex flex-col animate-[slideInLeft_0.3s_ease-out]"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            onClick={handleClose}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                PrintFlow
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 leading-none">
                Printing Management
              </p>
            </div>
          </Link>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
              {user?.first_name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Link to="/logout"
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 w-full px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default MobileSidebar;