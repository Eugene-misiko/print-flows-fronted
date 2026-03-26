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
import MobileSidebar from "./MobileSidebar";


const Sidebar = ({ user }) => {

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter = user?.role === "printer";
  const isClient = user?.role === "client";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      isActive
        ? "bg-orange-50 text-orange-600 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 border-r border-gray-200 min-h-screen flex flex-col dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow">
            <Printer className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <span className="font-bold text-lg text-white dark:text-white">PrintFlow</span>
            <p className="text-xs text-gray-500 dark:text-white/60">Printing Management</p>
          </div>
        </div>
      </div> 
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto ">
        {/* Dashboard - Everyone */}
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-5 h-5 " />
         <p className="text-white dark:text-white">Dashboard</p>
        </NavLink>

        {/* Orders - Everyone */}
        <NavLink to="/orders" className={linkClass}>
          <ShoppingBag className="w-5 h-5" />
          Orders
        </NavLink>

        {/* Create Order - Admin & Client */}
        {(isAdmin || isClient) && (
          <NavLink to="/orders/new" className={linkClass}>
            <PlusCircle className="w-5 h-5" />
            New Order
          </NavLink>
        )}

        {/* Users - Admin Only */}
        {isAdmin && (
          <NavLink to="/users" className={linkClass}>
            <Users className="w-5 h-5" />
            Team
          </NavLink>
        )}

        {/* Products - Admin Only */}
        {isAdmin && (
          <NavLink to="/products" className={linkClass}>
            <Package className="w-5 h-5" />
            Products
          </NavLink>
        )}

        {/* Invoices - Admin, Designer, Printer */}
        {(isAdmin || isDesigner || isPrinter ) && (
          <NavLink to="/invoices" className={linkClass}>
            <FileText className="w-5 h-5" />
            Invoices
          </NavLink>
        )}

        {/* Payments - Everyone */}
        <NavLink to="/payments" className={linkClass}>
          <CreditCard className="w-5 h-5" />
          Payments
        </NavLink>

        {/* Messages - Everyone */}
        <NavLink to="/messages" className={linkClass}>
          <MessageSquare className="w-5 h-5" />
          Messages
        </NavLink>

        {/* Settings - Admin Only */}
        {isAdmin && (
          <NavLink to="/settings" className={linkClass}>
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
        )}
      </nav>

      {/* User Role Badge */}
      <div className="p-4 border-t border-gray-200">
        <div className="border border-sky-400 rounded-lg p-6 bg-black
            transition-all duration-300 ease-in-out
            hover:shadow-[0_0_15px_5px_rgba(56,189,248,0.5)] 
            hover:border-sky-300">
          <p className="text-xs text-gray-500 mb-1 ">Logged in as</p>
          <p className="text-sm font-medium text-white/60 capitalize">
            {user?.role?.replace("_", " ") || "User"}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
