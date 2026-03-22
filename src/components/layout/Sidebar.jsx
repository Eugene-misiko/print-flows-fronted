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
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { logout } from "@/store/slices/authslice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
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
}