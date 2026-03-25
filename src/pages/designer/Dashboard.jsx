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
    { title: "Assigned", value: pending, icon: AlertCircle, color: "bg-yellow-500" },
    { title: "In Progress", value: inProgress, icon: Palette, color: "bg-blue-500" },
    { title: "Completed", value: completed, icon: CheckCircle, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
        <p className="text-gray-500">Manage your design assignments</p>
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

      {/* Assignments */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            My Assignments
          </h2>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : myAssignments?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Palette className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p>No assignments yet</p>
            </div>
          ) : (
            myAssignments?.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.order_number || `Order #${order.id}`}
                    </p>
                    <p className="text-sm text-gray-500">{order.description || "No description"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "design_completed" ? "bg-green-100 text-green-700" :
                    order.status === "design_in_progress" ? "bg-blue-100 text-blue-700" :
                    order.status === "assigned_to_designer" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
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
