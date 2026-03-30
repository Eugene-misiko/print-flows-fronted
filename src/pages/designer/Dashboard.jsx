import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAssignments } from "../../store/slices/ordersSlice";
import { Palette, Clock, CheckCircle, AlertCircle } from "lucide-react";

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const { myAssignments, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyAssignments());
  }, [dispatch]);

  // Order statuses for designers (lowercase)
  const pending = myAssignments?.filter(o => 
    o.status === "assigned_to_designer" || o.status === "pending"
  )?.length || 0;
  
  const inProgress = myAssignments?.filter(o => 
    o.status === "design_in_progress"
  )?.length || 0;
  
  const completed = myAssignments?.filter(o => 
    o.status === "design_completed" || o.status === "approved_for_printing"
  )?.length || 0;

  const stats = [
    { 
      title: "Assigned", 
      value: pending, 
      icon: AlertCircle, 
      lightBg: "bg-yellow-50",
      darkBg: "dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    { 
      title: "In Progress", 
      value: inProgress, 
      icon: Palette, 
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      title: "Completed", 
      value: completed, 
      icon: CheckCircle, 
      lightBg: "bg-green-50",
      darkBg: "dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your design assignments</p>
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

      {/* Assignments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            My Assignments
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : myAssignments?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Palette className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p>No assignments yet</p>
            </div>
          ) : (
            myAssignments?.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.order_number || `Order #${order.id}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.description || "No description"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "design_completed" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : order.status === "design_in_progress" 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                    : order.status === "assigned_to_designer" 
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {order.status?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;