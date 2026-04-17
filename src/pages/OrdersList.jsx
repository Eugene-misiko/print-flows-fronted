import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { ShoppingBag, Plus, Search, X, ChevronRight, Package } from "lucide-react";

const STATUS_BADGES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
  assigned_to_designer: "bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/40",
  design_in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40",
  design_completed: "bg-cyan-100 text-cyan-700 border-cyan-200/60 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800/40",
  design_rejected: "bg-red-100 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
  approved_for_printing: "bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/40",
  printing_queued: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  printing: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  polishing: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  ready_for_pickup: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  out_for_delivery: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  cancelled: "bg-stone-100 text-stone-600 border-stone-200/60 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700/60",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "assigned_to_designer", label: "Assigned to Designer" },
  { value: "design_in_progress", label: "Design In Progress" },
  { value: "design_completed", label: "Design Completed" },
  { value: "approved_for_printing", label: "Approved for Printing" },
  { value: "printing", label: "Printing" },
  { value: "polishing", label: "Polishing" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtCurr = (a) => `KES ${(a || 0).toLocaleString()}`;

const Badge = ({ children, config }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}>{children}</span>
);

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { dispatch(fetchOrders({ search, status })); }, [dispatch, search, status]);

  const inputCls = "w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all";

  const hasActiveFilters = search || status;

  // ─── Mobile Card ─────────────────────────────────────────
  const OrderCard = ({ order }) => (
    <Link to={`/app/orders/${order.id}`} className="block bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 space-y-4 transition-colors duration-300 hover:shadow-lg hover:shadow-stone-200/30 dark:hover:shadow-stone-900/20 active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{order.order_number || `#${order.id}`}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{fmtDate(order.created_at)}</p>
        </div>
        <Badge config={STATUS_BADGES[order.status] || STATUS_BADGES.pending}>{fmt(order.status)}</Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400 dark:text-stone-500">Client</span>
          <span className="font-semibold text-stone-700 dark:text-stone-300 truncate ml-4">{order.user_name || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400 dark:text-stone-500">Items</span>
          <span className="text-stone-600 dark:text-stone-400 truncate ml-4 max-w-[60%] text-right">
            {order.items?.length > 0
              ? order.items.slice(0, 2).map((i) => i.product_name || "Product").join(", ") + (order.items.length > 2 ? ` +${order.items.length - 2}` : "")
              : "N/A"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
        <span className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">{fmtCurr(order.total_price)}</span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#c2410c]">
          View Order <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );

  const EmptyState = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
        <ShoppingBag className="w-6 h-6 text-stone-300 dark:text-stone-600" />
      </div>
      <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{text}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{hasActiveFilters ? "Try clearing your filters" : "Orders will appear here once placed"}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#c2410c]" />
            </div>
            Orders
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">Track and manage all orders</p>
        </div>
        {!isAdmin && (
          <Link to="/orders/new" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" /> New Order
          </Link>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Header + Filters */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">All Orders</h2>
              {orders?.length > 0 && (
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">{orders.length} result{orders.length !== 1 && "s"}</span>
              )}
              {hasActiveFilters && (
                <button onClick={() => { setSearch(""); setStatus(""); }} className="text-[11px] font-semibold text-[#c2410c] hover:text-[#92400e] transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" />Clear
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search order number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-56 pl-10 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all appearance-none cursor-pointer pr-8"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders?.length === 0 ? (
            <EmptyState text={hasActiveFilters ? "No orders match your filters" : "No orders yet"} />
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                {["Order", "Client", "Items", "Status", "Total", "Date", ""].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-stone-400 dark:text-stone-500">Loading orders...</p>
                  </td>
                </tr>
              ) : orders?.length === 0 ? (
                <tr><td colSpan="7"><EmptyState text={hasActiveFilters ? "No orders match your filters" : "No orders yet"} /></td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{order.order_number || `#${order.id}`}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-stone-500 dark:text-stone-400">{order.user_name || "N/A"}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
                        <span className="text-sm text-stone-500 dark:text-stone-400 truncate">
                          {order.items?.length > 0
                            ? order.items.slice(0, 2).map((i) => i.product_name || "Product").join(", ") + (order.items.length > 2 ? ` +${order.items.length - 2}` : "")
                            : "N/A"}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 ml-5">{order.items?.length || 0} item{order.items?.length !== 1 && "s"}</p>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <Badge config={STATUS_BADGES[order.status] || STATUS_BADGES.pending}>{fmt(order.status)}</Badge>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">{fmtCurr(order.total_price)}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-stone-400 dark:text-stone-500 tabular-nums">{fmtDate(order.created_at)}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-[#c2410c] hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 border border-transparent hover:border-[#c2410c]/15 dark:hover:border-[#c2410c]/20 transition-all active:scale-95"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;