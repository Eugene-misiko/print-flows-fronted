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
} from "lucide-react";
import { setMobileSidebarOpen } from "../../store/slices/uiSlice";
import { logout } from "@/store/slices/authslice";
const MobileSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mobileSidebarOpen } = useSelector((state) => state.ui);
  const { unreadCount } = useSelector((state) => state.notifications);

  const getRoleBasedMenu = () => {
    const role = user?.role;

    const commonItems = [
      { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/orders", icon: ShoppingCart, label: "Orders" },
      { path: "/messages", icon: MessageSquare, label: "Messages" },
      { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    ];

    switch (role) {
      case "ADMIN":
        return [
          ...commonItems,
          { path: "/products", icon: Package, label: "Products" },
          { path: "/users", icon: Users, label: "Users" },
          { path: "/payments", icon: CreditCard, label: "Payments" },
          { path: "/invoices", icon: FileText, label: "Invoices" },
          { path: "/settings", icon: Settings, label: "Settings" },
        ];
      case "DESIGNER":
        return [
          { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { path: "/design-tasks", icon: Palette, label: "Design Tasks" },
          { path: "/orders", icon: ShoppingCart, label: "Orders" },
          { path: "/messages", icon: MessageSquare, label: "Messages" },
          { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
        ];
      case "PRINTER":
        return [
          { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { path: "/print-jobs", icon: Printer, label: "Print Jobs" },
          { path: "/orders", icon: ShoppingCart, label: "Orders" },
          { path: "/messages", icon: MessageSquare, label: "Messages" },
          { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
        ];
      case "CLIENT":
        return [
          { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { path: "/orders", icon: ShoppingCart, label: "My Orders" },
          { path: "/products", icon: Package, label: "Products" },
          { path: "/payments", icon: CreditCard, label: "Payments" },
          { path: "/messages", icon: MessageSquare, label: "Messages" },
          { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
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
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={handleClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-white shadow-xl lg:hidden">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={handleClose}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PrintFlow</span>
          </Link>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-medium">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 w-full px-3 py-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;