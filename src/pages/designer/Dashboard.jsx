import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyAssignments } from "../../store/slices/ordersSlice";
import { Palette, Clock, CheckCircle, AlertCircle, ChevronRight, RotateCcw } from "lucide-react";

const STATUS_BADGES = {
  assigned_to_designer: "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
  design_in_progress: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  design_completed: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  design_rejected: "bg-red-100 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
  approved_for_printing: "bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/40",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const Badge = ({ children, config }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}>{children}</span>
);

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const { myAssignments, isLoading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyAssignments()); }, [dispatch]);

  const assigned = myAssignments?.filter((o) => o.status === "assigned_to_designer")?.length || 0;
  const inProgress = myAssignments?.filter((o) => o.status === "design_in_progress")?.length || 0;
  const completed = myAssignments?.filter((o) => o.status === "design_completed" || o.status === "approved_for_printing")?.length || 0;

  const stats = [
    { title: "Assigned", value: assigned, icon: AlertCircle, gradient: "bg-gradient-to-br from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    { title: "In Progress", value: inProgress, icon: Palette, gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
    { title: "Completed", value: completed, icon: CheckCircle, gradient: "bg-gradient-to-br from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
        <Palette className="w-6 h-6 text-stone-300 dark:text-stone-600" />
      </div>
      <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">No assignments yet</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Design tasks will appear here when assigned</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-[#c2410c]" />
          </div>
          Designer Dashboard
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">Manage your design assignments</p>
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

      {/* Assignments List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-[#c2410c]" />
            </div>
            My Assignments
          </h2>
          {myAssignments?.length > 0 && (
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">{myAssignments.length} total</span>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myAssignments?.length === 0 ? (
            <EmptyState />
          ) : (
            myAssignments.map((order) => (
              <Link
                key={order.id}
                to={`/app/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{order.order_number || `Order #${order.id}`}</p>
                  </div>
                  <p className="text-sm text-stone-400 dark:text-stone-500 truncate mt-0.5 leading-relaxed">
                    {order.design_description || order.description || "No description"}
                  </p>
                  {order.design_revisions > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <RotateCcw className="w-3 h-3 text-[#c2410c]" />
                      <span className="text-[11px] font-semibold text-[#c2410c] tabular-nums">
                        {order.design_revisions}/{order.max_revisions} revisions used
                      </span>
                      {order.design_revisions >= order.max_revisions && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md">Limit</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge config={STATUS_BADGES[order.status] || "bg-stone-100 text-stone-600 border-stone-200/60 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700/60"}>
                    {fmt(order.status)}
                  </Badge>
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

export default DesignerDashboard;