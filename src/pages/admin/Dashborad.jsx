import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Printer,
  Palette,
} from "lucide-react";
import { companyAPI } from "@/api/api";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { fetchUsers } from "@/store/slices/usersSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading: ordersLoading } = useSelector((state) => state.orders);
  const { users, isLoading: usersLoading } = useSelector((state) => state.users);

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await companyAPI.getDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
    dispatch(fetchOrders({ page: 1, page_size: 5 }));
    dispatch(fetchUsers({ page: 1, page_size: 5 }));
  }, [dispatch]);

  const stats = dashboardData?.stats || {
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_revenue: 0,
    total_clients: 0,
    total_designers: 0,
    total_printers: 0,
  };

  const recentOrders = dashboardData?.recent_orders || [];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PENDING_DESIGN: "bg-purple-100 text-purple-700",
      DESIGN_IN_PROGRESS: "bg-indigo-100 text-indigo-700",
      DESIGN_REJECTED: "bg-red-100 text-red-700",
      AWAITING_PRINT: "bg-cyan-100 text-cyan-700",
      PRINTING: "bg-blue-100 text-blue-700",
      PRINTING_COMPLETED: "bg-teal-100 text-teal-700",
      POLISHING: "bg-orange-100 text-orange-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };


}