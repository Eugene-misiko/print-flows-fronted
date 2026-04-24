import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../../store/slices/ordersSlice";
import {
  ShoppingBag, Clock, Package, Plus, ChevronRight, ArrowRight,
  CheckCircle, Truck, Palette, Printer, Star, AlertCircle,
  CreditCard, Eye,
} from "lucide-react";
//─── helpers ─── 
const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
const fmtDateFull = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
const fmtCurr = (a) => `KES ${(a || 0).toLocaleString()}`;

//All statuses a client might see, in order 
const ALL_STEPS = [
  { key: "pending",               label: "Order Placed",   icon: Package },
  { key: "assigned_to_designer",  label: "Designer Assigned", icon: Palette },
  { key: "design_in_progress",    label: "Designing",      icon: Palette },
  { key: "design_completed",      label: "Your Review",    icon: Eye },
  { key: "approved_for_printing", label: "Approved",       icon: CheckCircle },
  { key: "printing",              label: "Printing",       icon: Printer },
  { key: "polishing",             label: "Finishing",      icon: Star },
  { key: "ready_for_pickup",      label: "Ready",          icon: Package },
  { key: "out_for_delivery",      label: "Out for Delivery", icon: Truck },
  { key: "completed",             label: "Delivered",      icon: CheckCircle },
];

const NO_DESIGN_STEPS = [
  { key: "pending",               label: "Order Placed",   icon: Package },
  { key: "approved_for_printing", label: "Approved",       icon: CheckCircle },
  { key: "printing",              label: "Printing",       icon: Printer },
  { key: "polishing",             label: "Finishing",      icon: Star },
  { key: "ready_for_pickup",      label: "Ready",          icon: Package },
  { key: "out_for_delivery",      label: "Out for Delivery", icon: Truck },
  { key: "completed",             label: "Delivered",      icon: CheckCircle },
];

const STATUS_ORDER = [
  "pending", "assigned_to_designer", "design_in_progress", "design_completed",
  "approved_for_printing", "printing_queued", "printing", "polishing",
  "ready_for_pickup", "out_for_delivery", "completed",
];

//badge colors
const STATUS_COLORS = {
  pending:               "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
  assigned_to_designer:  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/40",
  design_in_progress:    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/40",
  design_completed:      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800/40",
  approved_for_printing: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/40",
  printing:              "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40",
  polishing:             "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/40",
  ready_for_pickup:      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
  out_for_delivery:      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/40",
  completed:             "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
  cancelled:             "bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700",
  design_rejected:       "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
    {fmt(status)}
  </span>
);

//Action needed banners for client orders. These are shown on the dashboard when an order is in a state that requires the client's attention, such as awaiting design approval or payment.
const getActionNeeded = (order) => {
  if (order.status === "design_completed")
    return { msg: "Your design is ready — please review and approve or request changes.", color: "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/15 dark:border-cyan-800/30 dark:text-cyan-300", icon: Eye };
  if (order.invoice && !order.invoice.is_deposit_paid && order.status !== "cancelled")
    return { msg: "Deposit payment required to start work.", color: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/15 dark:border-red-800/30 dark:text-red-300", icon: CreditCard };
  if (order.status === "ready_for_pickup" && order.transportation?.transport_type === "pickup")
    return { msg: "Your order is ready for collection!", color: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/15 dark:border-emerald-800/30 dark:text-emerald-300", icon: Package };
  if (order.status === "out_for_delivery")
    return { msg: "Your order is on its way!", color: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/15 dark:border-sky-800/30 dark:text-sky-300", icon: Truck };
  return null;
};

/* Mini progress bar for order card */
const MiniProgress = ({ order }) => {
  const steps = order.needs_design ? ALL_STEPS : NO_DESIGN_STEPS;
  const statusIdx = STATUS_ORDER.indexOf(order.status);
  const currentStep = steps.findIndex((s) => STATUS_ORDER.indexOf(s.key) >= statusIdx && STATUS_ORDER.indexOf(s.key) <= statusIdx + 1);
  const doneCount = steps.filter((s) => STATUS_ORDER.indexOf(s.key) < statusIdx).length;
  const pct = Math.round((doneCount / (steps.length - 1)) * 100);

  if (["cancelled", "design_rejected"].includes(order.status)) return null;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-stone-400 mb-1.5 font-medium">
        <span>{steps.find((s) => s.key === order.status)?.label || fmt(order.status)}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#c2410c] to-[#ea580c]"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
};

//Full status tracker shown inside expanded order 
const StatusTracker = ({ order }) => {
  const steps = order.needs_design ? ALL_STEPS : NO_DESIGN_STEPS;
  const statusIdx = STATUS_ORDER.indexOf(order.status);

  if (["cancelled", "design_rejected"].includes(order.status)) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border ${order.status === "cancelled" ? "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400"}`}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        {order.status === "cancelled" ? "Order was cancelled" : `Design rejected: ${order.rejection_reason || "see order details"}`}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="relative min-w-max" style={{ minWidth: `${steps.length * 64}px` }}>
        {/* connector */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-stone-200 dark:bg-stone-700" />
        <div className="relative flex">
          {steps.map((step, i) => {
            const stepIdx = STATUS_ORDER.indexOf(step.key);
            const done    = statusIdx > stepIdx;
            const current = order.status === step.key;
            const Icon    = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center z-10" style={{ flex: 1, minWidth: 64 }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${done    ? "bg-emerald-500 border-emerald-500 text-white"
                  : current ? "bg-[#c2410c] border-[#c2410c] text-white ring-4 ring-[#c2410c]/20"
                  :           "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600"}`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <p className={`mt-1.5 text-[9px] text-center leading-tight max-w-[56px] font-medium
                  ${current ? "text-[#c2410c] dark:text-[#ea580c] font-bold"
                  : done    ? "text-emerald-600 dark:text-emerald-400"
                  :           "text-stone-400 dark:text-stone-600"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

  // MAIN COMPONENT

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const pending    = myOrders?.filter((o) => ["pending", "assigned_to_designer"].includes(o.status))?.length || 0;
  const inProgress = myOrders?.filter((o) => !["pending", "completed", "cancelled", "ready_for_pickup", "out_for_delivery"].includes(o.status))?.length || 0;
  const readyOrOut = myOrders?.filter((o) => ["ready_for_pickup", "out_for_delivery"].includes(o.status))?.length || 0;
  const completed  = myOrders?.filter((o) => o.status === "completed")?.length || 0;

  const activeOrders   = myOrders?.filter((o) => !["completed", "cancelled"].includes(o.status)) || [];
  const pastOrders     = myOrders?.filter((o) => ["completed", "cancelled"].includes(o.status)) || [];
  const actionRequired = myOrders?.filter((o) => getActionNeeded(o)) || [];

  const stats = [
    { title: "Pending",    value: pending,    icon: Clock,        gradient: "from-amber-500 to-orange-500",  shadow: "shadow-amber-500/25" },
    { title: "In Progress",value: inProgress, icon: Package,      gradient: "from-blue-500 to-indigo-500",   shadow: "shadow-blue-500/25" },
    { title: "Ready / Out",value: readyOrOut, icon: Truck,        gradient: "from-sky-500 to-cyan-500",      shadow: "shadow-sky-500/25" },
    { title: "Completed",  value: completed,  icon: CheckCircle,  gradient: "from-emerald-500 to-teal-500",  shadow: "shadow-emerald-500/25" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#c2410c]" />
            </div>
            My Orders
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5 ml-[42px]">Track your print jobs from start to delivery</p>
        </div>
        <Link to="/app/orders/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98] transition-all">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-4 flex items-center gap-3 transition-colors duration-300">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg ${s.shadow} shrink-0`}>
              <s.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider leading-none">{s.title}</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ACTION REQUIRED BANNER ── */}
      {actionRequired.length > 0 && (
        <div className="space-y-2.5">
          {actionRequired.map((order) => {
            const action = getActionNeeded(order);
            const Icon = action.icon;
            return (
              <Link key={order.id} to={`/app/orders/${order.id}`}
                className={`flex items-center justify-between gap-3 p-4 rounded-2xl border font-medium text-sm transition-all hover:opacity-90 ${action.color}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wide opacity-70 mb-0.5">Action Required — Order #{order.order_number}</p>
                    <p>{action.msg}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {/* ── ACTIVE ORDERS ── */}
      {activeOrders.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300 ">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between ">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse" />
              Active Orders
            </h2>
            <span className="text-xs font-semibold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full">{activeOrders.length}</span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeOrders.map((order) => (
              <div key={order.id} className="p-5">
                {/* order header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link to={`/app/orders/${order.id}`}
                        className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-[#c2410c] transition-colors">
                        #{order.order_number || order.id}
                      </Link>
                      <StatusBadge status={order.status} />
                      {order.priority !== "normal" && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#fff7ed] dark:bg-[#c2410c]/15 text-[#c2410c] dark:text-[#ea580c] rounded border border-[#c2410c]/20 font-bold uppercase">{order.priority}</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                      Placed {fmtDate(order.created_at)}
                      {order.estimated_completion && (
                        <> · Est. <span className="font-semibold text-[#c2410c] dark:text-[#ea580c]">{fmtDateFull(order.estimated_completion)}</span></>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{fmtCurr(order.total_price)}</p>
                    {order.invoice && (
                      <p className={`text-[10px] font-semibold mt-0.5 ${order.invoice.status === "paid" ? "text-emerald-500" : order.invoice.status === "partial" ? "text-amber-500" : "text-red-400"}`}>
                        {order.invoice.status === "paid" ? "Paid" : order.invoice.status === "partial" ? "Deposit paid" : "Unpaid"}
                      </p>
                    )}
                  </div>
                </div>

                {/* items summary */}
                {order.items?.length > 0 && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 truncate">
                    {order.items.slice(0, 2).map((i) => i.product_name || "Product").join(", ")}
                    {order.items.length > 2 && <span className="text-stone-400"> +{order.items.length - 2} more</span>}
                  </p>
                )}

                {/* progress tracker */}
                <StatusTracker order={order} />

                {/* transport info if out for delivery */}
                {order.transportation && order.status === "out_for_delivery" && (
                  <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/10 border border-sky-200/50 dark:border-sky-800/30 rounded-xl flex items-center gap-2.5 text-sm">
                    <Truck className="w-4 h-4 text-sky-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sky-700 dark:text-sky-300">On the way!</span>
                      {order.transportation.delivery_address && (
                        <span className="text-sky-600 dark:text-sky-400 ml-1.5 truncate">— {order.transportation.delivery_address}</span>
                      )}
                    </div>
                    {order.transportation.tracking_number && (
                      <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-0.5 rounded">
                        {order.transportation.tracking_number}
                      </span>
                    )}
                  </div>
                )}

                {/* ready for pickup notice */}
                {order.status === "ready_for_pickup" && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl flex items-center gap-2.5 text-sm">
                    <Package className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {order.transportation?.transport_type === "pickup" ? "Ready for collection at our shop!" : "Being prepared for dispatch."}
                    </span>
                  </div>
                )}

                {/* design review CTA */}
                {order.status === "design_completed" && (
                  <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200/50 dark:border-cyan-800/30 rounded-xl flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="font-semibold text-cyan-700 dark:text-cyan-300">Your design is ready for review!</span>
                    </div>
                    <Link to={`/app/orders/${order.id}`}
                      className="shrink-0 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition-colors">
                      Review
                    </Link>
                  </div>
                )}

                {/* unpaid invoice warning */}
                {order.invoice && !order.invoice.is_deposit_paid && order.status !== "cancelled" && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-semibold text-red-600 dark:text-red-400">Deposit payment required to start work</span>
                    </div>
                    <Link to={`/app/orders/${order.id}`}
                      className="shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                      Pay Now
                    </Link>
                  </div>
                )}

                {/* view details link */}
                <div className="mt-3 flex justify-end">
                  <Link to={`/app/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#c2410c] hover:text-[#92400e] transition-colors">
                    View details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!isLoading && activeOrders.length === 0 && pastOrders.length === 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-5">
            <ShoppingBag className="w-7 h-7 text-stone-300 dark:text-stone-600" />
          </div>
          <p className="text-sm font-bold text-stone-600 dark:text-stone-400">No orders yet</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 max-w-xs">Place your first print order to get started. We'll keep you updated every step of the way.</p>
          <Link to="/app/orders/new"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" /> Create Order
          </Link>
        </div>
      )}

      {/* ── PAST ORDERS ── */}
      {pastOrders.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <h2 className="font-bold text-stone-700 dark:text-stone-300 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Past Orders
            </h2>
            {pastOrders.length > 5 && (
              <Link to="/app/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c2410c] hover:text-[#92400e] transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {pastOrders.slice(0, 5).map((order) => (
              <Link key={order.id} to={`/app/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300 truncate">#{order.order_number || order.id}</p>
                    <StatusBadge status={order.status} />
                    {order.created_at && <span className="text-[11px] text-stone-400 tabular-nums">{fmtDate(order.created_at)}</span>}
                  </div>
                  <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">
                    {order.items?.slice(0, 2).map((i) => i.product_name || "Product").join(", ") || "View details"}
                    {order.items?.length > 2 && ` +${order.items.length - 2}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300 tabular-nums">{fmtCurr(order.total_price)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-[#c2410c] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;