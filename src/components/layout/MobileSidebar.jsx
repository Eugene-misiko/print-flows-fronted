import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {LayoutDashboard,Package,Users,Settings,ShoppingCart,CreditCard,MessageSquare,Printer,X, LogOut, PlusCircle, FileText, ChevronRight,
} from "lucide-react";
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
          { path: "/app/invoices", icon: FileText, label: "Invoices" },
          { path: "/app/settings", icon: Settings, label: "Settings" },
        ];
      case "designer":
        return [
          ...commonItems,
          { path: "/app/invoices", icon: FileText, label: "Invoices" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
        ];
      case "printer":
        return [
          ...commonItems,
          { path: "/app/invoices", icon: FileText, label: "Invoices" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
        ];
      case "client":
        return [
          ...commonItems,
          { path: "/app/orders/new", icon: PlusCircle, label: "New Order" },
          { path: "/app/products", icon: Package, label: "Products" },
          { path: "/app/payments", icon: CreditCard, label: "Payments" },
          { path: "/app/invoices", icon: FileText, label: "Invoices" },
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#1c1917]/50 dark:bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        onClick={handleClose}
        style={{ animation: "backdropFadeIn 0.25s ease-out forwards" }}
      />

      {/* Drawer */}
      <aside
        className="fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] bg-white dark:bg-stone-950 shadow-2xl shadow-stone-900/10 dark:shadow-black/40 lg:hidden flex flex-col border-r border-stone-200/50 dark:border-stone-800"
        style={{ animation: "drawerSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <Link to="/app/dashboard" className="flex items-center gap-3" onClick={handleClose}>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-25 scale-110" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Printer className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                PrintFlow
              </span>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-none font-medium">
                Printing Management
              </p>
            </div>
          </Link>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 transition-all duration-200 active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleClose}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#c2410c]/15 dark:text-[#ea580c] font-semibold shadow-sm"
                    : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                style={{
                  opacity: 0,
                  transform: "translateX(-8px)",
                  animation: `menuItemIn 0.3s ${80 + index * 40}ms cubic-bezier(0.16,1,0.3,1) forwards`,
                }}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 text-sm">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-stone-100 dark:border-stone-800 p-4 shrink-0 space-y-3">
          <div className="border border-stone-200/70 dark:border-[#c2410c]/20 rounded-xl p-4 bg-stone-50/50 dark:bg-[#c2410c]/5 transition-all duration-300">
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

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200/70 dark:border-red-800/30 rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default MobileSidebar;