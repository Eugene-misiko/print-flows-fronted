import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../../store/slices/ordersSlice";
import { ShoppingBag, Clock, Package, Plus } from "lucide-react";

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  // Order statuses (lowercase)
  const pending = myOrders?.filter(o => o.status === "pending" || o.status === "assigned_to_designer")?.length || 0;
  const inProgress = myOrders?.filter(o => 
    !["pending", "completed", "cancelled", "ready_for_pickup"].includes(o.status)
  )?.length || 0;
  const completed = myOrders?.filter(o => 
    o.status === "completed" || o.status === "ready_for_pickup"
  )?.length || 0;

  const stats = [
    { 
      title: "Pending", 
      value: pending, 
      icon: Clock, 
      lightBg: "bg-yellow-50",
      darkBg: "dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    { 
      title: "In Progress", 
      value: inProgress, 
      icon: Package, 
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      title: "Completed", 
      value: completed, 
      icon: ShoppingBag, 
      lightBg: "bg-green-50",
      darkBg: "dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your orders</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.lightBg} ${stat.darkBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">My Orders</h2>
          <Link to="/orders" className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : myOrders?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p>No orders yet</p>
              <Link to="/orders/new" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm transition-colors">
                Create your first order
              </Link>
            </div>
          ) : (
            myOrders?.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.order_number || `Order #${order.id}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.description || "View details"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    KES {(order.total_price || 0).toLocaleString()}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "completed" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : order.status === "cancelled" 
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" 
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {order.status?.replace(/_/g, " ")}
                  </span>
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