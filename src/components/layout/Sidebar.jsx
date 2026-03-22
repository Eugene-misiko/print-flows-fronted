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
import { logout } from "../../store/slices/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { unreadCount } = useSelector((state) => state.notifications);
}