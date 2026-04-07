import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { ShoppingBag, Plus, Search } from "lucide-react";

const STATUS_BADGES = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  assigned_to_designer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  design_in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  design_completed: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  design_rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  approved_for_printing: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  printing_queued: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  printing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  polishing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  ready_for_pickup: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  out_for_delivery: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { dispatch(fetchOrders({ search, status })); }, [dispatch, search, status]);

  const inputClass = "w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all orders</p>
        </div>
        {!isAdmin && (
          <Link to="/orders/new" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all">
            <Plus className="w-4 h-4" /> New Order
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by order number..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} pl-10`} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned_to_designer">Assigned to Designer</option>
            <option value="design_in_progress">Design In Progress</option>
            <option value="design_completed">Design Completed</option>
            <option value="approved_for_printing">Approved for Printing</option>
            <option value="printing">Printing</option>
            <option value="polishing">Polishing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : orders?.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500"><ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap"><span className="font-medium text-gray-900 dark:text-white">{order.order_number || `#${order.id}`}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{order.user_name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.items?.length > 0 ? order.items.map((i) => i.product_name || "Product").join(", ") : "N/A"}<p className="text-xs text-gray-400">{order.items?.length || 0} item(s)</p></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 text-xs rounded-full font-medium ${STATUS_BADGES[order.status] || STATUS_BADGES.pending}`}>{fmt(order.status)}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">KES {order.total_price?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Link to={`/orders/${order.id}`} className="text-orange-600 dark:text-orange-400 hover:text-orange-700 text-sm font-medium">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;