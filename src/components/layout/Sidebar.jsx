// ═══════════════════════════════════════════════
// Sidebar.jsx
// ═══════════════════════════════════════════════
import React from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
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
  LogOut,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ user }) => {
  const { companySlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter = user?.role === "printer";
  const isClient = user?.role === "client";

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(`/store/${companySlug}/login`);
  };

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#c2410c]/15 dark:text-[#ea580c] font-semibold shadow-sm"
        : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-stone-800 dark:hover:text-stone-200"
    }`;

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen border-r border-stone-200/70 dark:border-stone-800 flex flex-col bg-white dark:bg-stone-950 transition-colors duration-300 z-30">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-25 scale-110" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20 transition-transform duration-300 hover:scale-105">
              <Printer className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight">
              PrintFlow
            </span>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
              Printing Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Section label */}
        <p className="px-3.5 mb-2 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
          Main
        </p>

        <NavLink to="/app/dashboard" className={linkClass}>
          <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
          <span className="text-sm flex-1">Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
        </NavLink>

        <NavLink to="/app/orders" className={linkClass}>
          <ShoppingBag className="w-[18px] h-[18px] shrink-0" />
          <span className="text-sm flex-1">Orders</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
        </NavLink>

        {(isAdmin || isClient) && (
          <NavLink to="/app/orders/new" className={linkClass}>
            <PlusCircle className="w-[18px] h-[18px] shrink-0" />
            <span className="text-sm flex-1">New Order</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
          </NavLink>
        )}

        {(isAdmin || isClient) && (
          <NavLink to="/app/products" className={linkClass}>
            <Package className="w-[18px] h-[18px] shrink-0" />
            <span className="text-sm flex-1">Products</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
          </NavLink>
        )}

        <NavLink to="/app/messages" className={linkClass}>
          <MessageSquare className="w-[18px] h-[18px] shrink-0" />
          <span className="text-sm flex-1">Messages</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
        </NavLink>

        {/* Divider */}
        <div className="!my-4 border-t border-stone-100 dark:border-stone-800" />

        <p className="px-3.5 mb-2 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
          Finance
        </p>

        <NavLink to="/app/payments" className={linkClass}>
          <CreditCard className="w-[18px] h-[18px] shrink-0" />
          <span className="text-sm flex-1">Payments</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
        </NavLink>

        {(isAdmin || isDesigner || isPrinter) && (
          <NavLink to="/app/invoices" className={linkClass}>
            <FileText className="w-[18px] h-[18px] shrink-0" />
            <span className="text-sm flex-1">Invoices</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
          </NavLink>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="!my-4 border-t border-stone-100 dark:border-stone-800" />
            <p className="px-3.5 mb-2 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              Admin
            </p>
            <NavLink to="/app/users" className={linkClass}>
              <Users className="w-[18px] h-[18px] shrink-0" />
              <span className="text-sm flex-1">Team</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
            </NavLink>

            <NavLink to="/app/settings" className={linkClass}>
              <Settings className="w-[18px] h-[18px] shrink-0" />
              <span className="text-sm flex-1">Settings</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0" />
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom User Info / Logout */}
      <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
        {/* User Role Card */}
        <div className="border border-stone-200/70 dark:border-[#c2410c]/20 rounded-xl p-4 bg-stone-50/50 dark:bg-[#c2410c]/5 transition-all duration-300 hover:border-[#c2410c]/30 dark:hover:border-[#c2410c]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-orange-600/15">
              {user?.role?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                Logged in as
              </p>
              <p className="text-sm font-bold text-stone-800 dark:text-[#ea580c] capitalize">
                {user?.role?.replace("_", " ") || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200/70 dark:border-red-800/30 rounded-xl transition-all duration-200 active:scale-[0.98] hover:shadow-sm hover:shadow-red-100 dark:hover:shadow-red-900/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;