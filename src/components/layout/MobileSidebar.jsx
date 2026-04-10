import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {LayoutDashboard,Package,Users,Settings,ShoppingCart,CreditCard,MessageSquare,Printer,X,LogOut,PlusCircle,} from "lucide-react";
import { setMobileSidebarOpen } from "../../store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";

const MobileSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mobileSidebarOpen } = useSelector((state) => state.ui);

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter = user?.role === "printer";
  const isClient = user?.role === "client";

  const getRoleBasedMenu = () => {
    const commonItems = [
      { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/app/orders", icon: ShoppingCart, label: "Orders" },
      { path: "/app/messages", icon: MessageSquare, label: "Messages" },
    ];

    switch (user?.role) {
      case "admin":
      case "platform_admin":
        return [
          ...commonItems,
          { path: "/app/orders/new", icon: PlusCircle, label: "New Order" },
          { path: "/app/products", icon: Package, label: "Products" },
          { path: "/app/users", icon: Users, label: "Team" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
          { path: "/app/invoices", icon: Settings, label: "Invoices" },
          { path: "/app/settings", icon: Settings, label: "Settings" },
        ];
      case "designer":
        return [
          ...commonItems,
          { path: "/app/orders", icon: ShoppingCart, label: "Orders" },
          { path: "/app/invoices", icon: CreditCard, label: "Invoices" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
        ];
      case "printer":
        return [
          ...commonItems,
          { path: "/app/orders", icon: ShoppingCart, label: "Orders" },
          { path: "/app/invoices", icon: CreditCard, label: "Invoices" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
        ];
      case "client":
        return [
          ...commonItems,
          { path: "/app/orders/new", icon: PlusCircle, label: "New Order" },
          { path: "/app/products", icon: Package, label: "Products" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
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
      <aside className="fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900 shadow-2xl lg:hidden flex flex-col animate-[slideInLeft_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to="/app/dashboard" className="flex items-center gap-2" onClick={handleClose}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">PrintFlow</span>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 leading-none">Printing Management</p>
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
        {/* Navigation */}
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
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0 space-y-3">
          <div className="border border-gray-200 dark:border-sky-500/30 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out dark:shadow-[0_0_10px_2px_rgba(56,189,248,0.15)]">
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Logged in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-sky-400 capitalize">
              {user?.role?.replace("_", " ") || "User"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default MobileSidebar;