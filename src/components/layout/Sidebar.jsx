import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  CreditCard,
  FileText,
  Settings,
  MessageSquare,
  Printer,
  PlusCircle,
} from "lucide-react";

const Sidebar = ({ user }) => {
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter = user?.role === "printer";
  const isClient = user?.role === "client";

  // Updated linkClass to handle Light & Dark modes correctly
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      isActive
        ? "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    }`;

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900 transition-colors duration-200">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow">
            <Printer className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">PrintFlow</span>
            <p className="text-xs text-gray-500 dark:text-gray-500">Printing Management</p>
          </div>
        </div>
      </div> 

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard - Everyone */}
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        {/* Orders - Everyone */}
        <NavLink to="/orders" className={linkClass}>
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </NavLink>

        {/* Create Order - Admin & Client */}
        {(isAdmin || isClient) && (
          <NavLink to="/orders/new" className={linkClass}>
            <PlusCircle className="w-5 h-5" />
            <span>New Order</span>
          </NavLink>
        )}

        {/* Users - Admin Only */}
        {isAdmin && (
          <NavLink to="/users" className={linkClass}>
            <Users className="w-5 h-5" />
            <span>Team</span>
          </NavLink>
        )}

        {/* Products - Admin Only */}
        { (isAdmin || isClient )&& (
          <NavLink to="/products" className={linkClass}>
            <Package className="w-5 h-5" />
            <span>Products</span>
          </NavLink>
        )}

        {/* Invoices - Admin, Designer, Printer */}
        {(isAdmin || isDesigner || isPrinter) && (
          <NavLink to="/invoices" className={linkClass}>
            <FileText className="w-5 h-5" />
            <span>Invoices</span>
          </NavLink>
        )}

        {/* Payments - Everyone */}
        <NavLink to="/payments" className={linkClass}>
          <CreditCard className="w-5 h-5" />
          <span>Payments</span>
        </NavLink>

        {/* Messages - Everyone */}
        <NavLink to="/messages" className={linkClass}>
          <MessageSquare className="w-5 h-5" />
          <span>Messages</span>
        </NavLink>

        {/* Settings - Admin Only */}
        {isAdmin && (
          <NavLink to="/settings" className={linkClass}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        )}
      </nav>

      {/* User Role Badge */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="border border-gray-200 dark:border-sky-500/30 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out dark:shadow-[0_0_10px_2px_rgba(56,189,248,0.15)]">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Logged in as</p>
          <p className="text-sm font-medium text-gray-900 dark:text-sky-400 capitalize">
            {user?.role?.replace("_", " ") || "User"}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;