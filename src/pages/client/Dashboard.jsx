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
    { title: "Pending", value: pending, icon: Clock, color: "bg-yellow-500" },
    { title: "In Progress", value: inProgress, icon: Package, color: "bg-blue-500" },
    { title: "Completed", value: completed, icon: ShoppingBag, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500">Track your orders</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Orders</h2>
          <Link to="/orders" className="text-sm text-orange-600 hover:text-orange-700">
            View all
          </Link>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : myOrders?.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link to="/orders/new" className="text-orange-600 hover:text-orange-700 text-sm">
                Create your first order
              </Link>
            </div>
          ) : (
            myOrders?.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="p-4 hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {order.order_number || `Order #${order.id}`}
                  </p>
                  <p className="text-sm text-gray-500">{order.description || "View details"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    KES {(order.total_price || 0).toLocaleString()}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === "completed" ? "bg-green-100 text-green-700" :
                    order.status === "cancelled" ? "bg-gray-100 text-gray-700" :
                    "bg-yellow-100 text-yellow-700"
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
