import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyAssignments } from "../../store/slices/ordersSlice";
import { Palette, Clock, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_BADGES = {
  assigned_to_designer: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  design_in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  design_completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  design_rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  approved_for_printing: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const { myAssignments, isLoading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyAssignments()); }, [dispatch]);

  const assigned = myAssignments?.filter((o) => o.status === "assigned_to_designer")?.length || 0;
  const inProgress = myAssignments?.filter((o) => o.status === "design_in_progress")?.length || 0;
  const completed = myAssignments?.filter((o) => o.status === "design_completed" || o.status === "approved_for_printing")?.length || 0;

  const stats = [
    { title: "Assigned", value: assigned, icon: AlertCircle, bg: "bg-yellow-50 dark:bg-yellow-900/30", color: "text-yellow-600 dark:text-yellow-400" },
    { title: "In Progress", value: inProgress, icon: Palette, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    { title: "Completed", value: completed, icon: CheckCircle, bg: "bg-green-50 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your design assignments</p>
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" /> My Assignments
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : myAssignments?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Palette className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p>No assignments yet</p>
            </div>
          ) : (
            myAssignments.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.order_number || `Order #${order.id}`}</p>
                  <p className="text-sm text-gray-500">{order.design_description || order.description || "No description"}</p>
                  {order.design_revisions > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{order.design_revisions}/{order.max_revisions} revisions used</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[order.status] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
                  {fmt(order.status)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;