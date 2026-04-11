import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../../store/slices/companySlice";
import { fetchOrders, fetchUnassigned } from "../../store/slices/ordersSlice";
import { fetchInvoices } from "../../store/slices/paymentsSlice";
import { ShoppingBag, Users, DollarSign, AlertCircle, Settings, UserCircle } from "lucide-react";

const STATUS_BADGES = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30",
  assigned_to_designer: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30",
  design_in_progress: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/30",
  design_completed: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/30",
  approved_for_printing: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30",
  printing: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30",
  polishing: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30",
  completed: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200/50 dark:border-green-800/30",
  cancelled: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200/50 dark:border-stone-700",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, isLoading: dashLoading } = useSelector((s) => s.company);
  const { orders, unassigned, isLoading: ordLoading } = useSelector((s) => s.orders);
  const { invoices } = useSelector((s) => s.payments);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchOrders({ limit: 10 }));
    dispatch(fetchUnassigned());
    dispatch(fetchInvoices({ limit: 5 }));
  }, [dispatch]);

  const stats = [
    { 
      title: "Total Orders", 
      value: dashboard?.total_orders || orders?.length || 0, 
      icon: ShoppingBag, 
      bg: "bg-[#fff7ed] dark:bg-[#c2410c]/10", 
      color: "text-[#c2410c] dark:text-[#ea580c]" 
    },
    { 
      title: "Active Staff", 
      value: dashboard?.active_staff || 0, 
      icon: Users, 
      bg: "bg-emerald-50 dark:bg-emerald-900/20", 
      color: "text-emerald-600 dark:text-emerald-400" 
    },
    { 
      title: "Revenue", 
      value: `KES ${(dashboard?.total_revenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      bg: "bg-amber-50 dark:bg-amber-900/20", 
      color: "text-amber-600 dark:text-amber-400" 
    },
    { 
      title: "Unassigned", 
      value: unassigned?.length || 0, 
      icon: AlertCircle, 
      bg: "bg-red-50 dark:bg-red-900/15", 
      color: "text-red-500 dark:text-red-400" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Overview of your printing business
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link to="/settings" className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-[.98] text-sm font-medium">
            <Settings className="w-4 h-4" />Settings
          </Link>
          <Link to="/users" className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-[.98] text-sm font-medium">
            <UserCircle className="w-4 h-4" />Users
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-5 sm:p-6 hover:shadow-md hover:shadow-stone-200/40 dark:hover:shadow-stone-900/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">{s.title}</p>
                <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2 tracking-tight">{s.value}</p>
              </div>
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center transition-colors duration-300`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <h2 className="font-bold text-stone-900 dark:text-stone-100">Recent Orders</h2>
            <Link to="/orders" className="text-sm font-semibold text-[#c2410c] dark:text-[#ea580c] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {ordLoading ? (
              <div className="p-10 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full mx-auto" />
              </div>
            ) : orders?.length === 0 ? (
              <div className="p-10 text-center text-stone-500 dark:text-stone-500">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6 text-stone-300 dark:text-stone-600" />
                </div>
                <p className="font-semibold">No orders yet</p>
              </div>
            ) : (
              orders.slice(0, 5).map((o) => (
                <Link key={o.id} to={`/orders/${o.id}`} className="p-4 sm:p-5 hover:bg-stone-50/80 dark:hover:bg-stone-800/50 flex items-center justify-between transition-colors group">
                  <div>
                    <p className="font-semibold text-stone-800 dark:text-stone-200 group-hover:text-[#c2410c] dark:group-hover:text-[#ea580c] transition-colors">
                      {o.order_number || `Order #${o.id}`}
                    </p>
                    <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">{o.user_name || "Client"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-900 dark:text-stone-100">KES {(o.total_price || 0).toLocaleString()}</p>
                    <span className={`inline-flex mt-1.5 px-2.5 py-0.5 text-[11px] rounded-lg font-semibold ${STATUS_BADGES[o.status] || STATUS_BADGES.pending}`}>
                      {fmt(o.status)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <h2 className="font-bold text-stone-900 dark:text-stone-100">Pending Invoices</h2>
            <Link to="/invoices" className="text-sm font-semibold text-[#c2410c] dark:text-[#ea580c] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {invoices?.length === 0 ? (
              <div className="p-10 text-center text-stone-500 dark:text-stone-500">
                <p className="font-semibold">No pending invoices</p>
              </div>
            ) : (
              invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="p-4 sm:p-5 hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-stone-800 dark:text-stone-200">{inv.invoice_number || `INV-${inv.id}`}</p>
                      <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">{inv.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#c2410c] dark:text-[#ea580c]">KES {(inv.balance_due || inv.total_amount || 0).toLocaleString()}</p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 font-medium">
                        {inv.is_deposit_paid ? "Balance pending" : "Deposit pending"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Unassigned Alert */}
      {unassigned?.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/70 dark:border-amber-800/30 rounded-2xl p-5 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 dark:text-amber-300">
                {unassigned.length} order{unassigned.length > 1 ? "s" : ""} awaiting assignment
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Assign designers and printers to start processing
              </p>
            </div>
            <Link to="/app/orders" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-amber-600/20 transition-all active:scale-[.98] whitespace-nowrap">
              View Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;