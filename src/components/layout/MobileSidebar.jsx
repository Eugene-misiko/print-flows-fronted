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