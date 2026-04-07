import React from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import {LayoutDashboard,ShoppingBag,Users,Package,CreditCard,FileText,Settings,MessageSquare,Printer,PlusCircle,LogOut,} from "lucide-react";

const Sidebar = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter = user?.role === "printer";
  const isClient = user?.role === "client";

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      isActive
        ? "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900 transition-colors duration-200 z-30">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              PrintFlow
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Printing Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/orders" className={linkClass}>
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </NavLink>

        {(isAdmin || isClient) && (
          <NavLink to="/orders/new" className={linkClass}>
            <PlusCircle className="w-5 h-5" />
            <span>New Order</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/users" className={linkClass}>
            <Users className="w-5 h-5" />
            <span>Team</span>
          </NavLink>
        )}

        {(isAdmin || isClient) && (
          <NavLink to="/products" className={linkClass}>
            <Package className="w-5 h-5" />
            <span>Products</span>
          </NavLink>
        )}

        {(isAdmin || isDesigner || isPrinter) && (
          <NavLink to="/invoices" className={linkClass}>
            <FileText className="w-5 h-5" />
            <span>Invoices</span>
          </NavLink>
        )}

        <NavLink to="/payments" className={linkClass}>
          <CreditCard className="w-5 h-5" />
          <span>Payments</span>
        </NavLink>

        <NavLink to="/messages" className={linkClass}>
          <MessageSquare className="w-5 h-5" />
          <span>Messages</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/settings" className={linkClass}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <div className="border border-gray-200 dark:border-sky-500/30 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out dark:shadow-[0_0_10px_2px_rgba(56,189,248,0.15)]">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
            Logged in as
          </p>
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
  );
};

export default Sidebar;