import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../../store/slices/companySlice";
import { fetchOrders, fetchUnassigned } from "../../store/slices/ordersSlice";
import { fetchInvoices } from "../../store/slices/paymentsSlice";
import { ShoppingBag, Users, DollarSign, AlertCircle, Settings, UserCircle } from "lucide-react";

const STATUS_BADGES = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  assigned_to_designer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  design_in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  design_completed: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  approved_for_printing: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  printing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  polishing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};
const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, isLoading: dashLoading } = useSelector((s) => s.company);
  const { orders, unassigned, isLoading: ordLoading } = useSelector((s) => s.orders);
  const { invoices } = useSelector((s) => s.payments);

  useEffect(() => { dispatch(fetchDashboard()); dispatch(fetchOrders({ limit: 10 })); dispatch(fetchUnassigned()); dispatch(fetchInvoices({ limit: 5 })); }, [dispatch]);

  const stats = [
    { title: "Total Orders", value: dashboard?.total_orders || orders?.length || 0, icon: ShoppingBag, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    { title: "Active Staff", value: dashboard?.active_staff || 0, icon: Users, bg: "bg-green-50 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
    { title: "Revenue", value: `KES ${(dashboard?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, bg: "bg-orange-50 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400" },
    { title: "Unassigned", value: unassigned?.length || 0, icon: AlertCircle, bg: "bg-yellow-50 dark:bg-yellow-900/30", color: "text-yellow-600 dark:text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1><p className="text-gray-500 dark:text-gray-400">Overview of your printing business</p></div>
        <div className="flex gap-2">
          <Link to="/settings" className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"><Settings className="w-4 h-4" />Settings</Link>
          <Link to="/users" className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"><UserCircle className="w-4 h-4" />Users</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.title}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p></div>
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-orange-600 dark:text-orange-400">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ordLoading ? (<div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" /></div>) : orders?.length === 0 ? (
              <div className="p-8 text-center text-gray-500"><ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p>No orders yet</p></div>
            ) : orders.slice(0, 5).map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between">
                <div><p className="font-medium">{o.order_number || `Order #${o.id}`}</p><p className="text-sm text-gray-500">{o.user_name || "Client"}</p></div>
                <div className="text-right"><p className="font-medium">KES {(o.total_price || 0).toLocaleString()}</p><span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGES[o.status] || STATUS_BADGES.pending}`}>{fmt(o.status)}</span></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Pending Invoices</h2>
            <Link to="/invoices" className="text-sm text-orange-600 dark:text-orange-400">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {invoices?.length === 0 ? (<div className="p-8 text-center text-gray-500"><p>No pending invoices</p></div>) : invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">{inv.invoice_number || `INV-${inv.id}`}</p><p className="text-sm text-gray-500">{inv.client_name}</p></div>
                  <div className="text-right"><p className="font-medium text-orange-600">KES {(inv.balance_due || inv.total_amount || 0).toLocaleString()}</p><p className="text-xs text-gray-500">{inv.is_deposit_paid ? "Balance pending" : "Deposit pending"}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unassigned Alert */}
      {unassigned?.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1"><p className="font-medium text-yellow-800 dark:text-yellow-300">{unassigned.length} order {unassigned.length > 1 ? "s" : ""} 
              awaiting assignment</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Assign designers and printers to start processing
                </p>
                </div>
            <Link to="/orders" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm shadow-sm">View Orders</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;