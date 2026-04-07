import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../../store/slices/ordersSlice";
import { ShoppingBag, Clock, Package, Plus } from "lucide-react";

const STATUS_BADGES = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  assigned_to_designer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  design_in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  design_completed: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  approved_for_printing: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  printing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  polishing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  ready_for_pickup: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const pending = myOrders?.filter((o) => o.status === "pending" || o.status === "assigned_to_designer")?.length || 0;
  const inProgress = myOrders?.filter((o) => !["pending", "completed", "cancelled", "ready_for_pickup"].includes(o.status))?.length || 0;
  const completed = myOrders?.filter((o) => o.status === "completed" || o.status === "ready_for_pickup")?.length || 0;

  const stats = [
    { title: "Pending", value: pending, icon: Clock, bg: "bg-yellow-50 dark:bg-yellow-900/30", color: "text-yellow-600 dark:text-yellow-400" },
    { title: "In Progress", value: inProgress, icon: Package, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    { title: "Completed", value: completed, icon: ShoppingBag, bg: "bg-green-50 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your orders</p>
        </div>
        <Link to="/orders/new" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.title}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p></div>
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">My Orders</h2>
          <Link to="/orders" className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700">View all</Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : myOrders?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p>No orders yet</p>
              <Link to="/orders/new" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 text-sm">Create your first order</Link>
            </div>
          ) : (
            myOrders.slice(0, 5).map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.order_number || `Order #${order.id}`}</p>
                  <p className="text-sm text-gray-500">{order.description || "View details"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">KES {(order.total_price || 0).toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[order.status] || STATUS_BADGES.pending}`}>{fmt(order.status)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;