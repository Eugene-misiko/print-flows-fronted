import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../../store/slices/ordersSlice";
import { ShoppingBag, Clock, Package, Plus, ChevronRight, ArrowRight } from "lucide-react";

const STATUS_BADGES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
  assigned_to_designer: "bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/40",
  design_in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40",
  design_completed: "bg-cyan-100 text-cyan-700 border-cyan-200/60 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800/40",
  approved_for_printing: "bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/40",
  printing: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  polishing: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  ready_for_pickup: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  cancelled: "bg-stone-100 text-stone-600 border-stone-200/60 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700/60",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
const fmtCurr = (a) => `KES ${(a || 0).toLocaleString()}`;

const Badge = ({ children, config }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}>{children}</span>
);

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const pending = myOrders?.filter((o) => o.status === "pending" || o.status === "assigned_to_designer")?.length || 0;
  const inProgress = myOrders?.filter((o) => !["pending", "completed", "cancelled", "ready_for_pickup"].includes(o.status))?.length || 0;
  const completed = myOrders?.filter((o) => o.status === "completed" || o.status === "ready_for_pickup")?.length || 0;

  const stats = [
    { title: "Pending", value: pending, icon: Clock, gradient: "bg-gradient-to-br from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    { title: "In Progress", value: inProgress, icon: Package, gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
    { title: "Completed", value: completed, icon: ShoppingBag, gradient: "bg-gradient-to-br from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#c2410c]" />
            </div>
            My Dashboard
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">Track and manage your orders</p>
        </div>
        <Link
          to="/app/orders/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 transition-colors duration-300">
            <div className={`w-11 h-11 rounded-xl ${s.gradient} flex items-center justify-center text-white shadow-lg ${s.shadow} shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">{s.title}</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#c2410c]" />
            </div>
            Recent Orders
          </h2>
          {myOrders?.length > 5 && (
            <Link
              to="/app/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c2410c] hover:text-[#92400e] transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myOrders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">No orders yet</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Place your first print order to get started</p>
              <Link
                to="/app/orders/new"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" /> Create Order
              </Link>
            </div>
          ) : (
            myOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/app/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{order.order_number || `Order #${order.id}`}</p>
                    {order.created_at && (
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium tabular-nums shrink-0">{fmtDate(order.created_at)}</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-400 dark:text-stone-500 truncate mt-0.5 leading-relaxed">
                    {order.items?.length > 0
                      ? order.items.slice(0, 2).map((i) => i.product_name || "Product").join(", ") + (order.items.length > 2 ? ` +${order.items.length - 2}` : "")
                      : order.description || "View details"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">{fmtCurr(order.total_price)}</p>
                    <Badge config={STATUS_BADGES[order.status] || STATUS_BADGES.pending}>{fmt(order.status)}</Badge>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-[#c2410c] group-hover:translate-x-0.5 transition-all" />
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