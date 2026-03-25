import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPrintJobs } from "../../store/slices/ordersSlice";
import { Printer, Clock, CheckCircle, Wrench } from "lucide-react";

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { myPrintJobs, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyPrintJobs());
  }, [dispatch]);

  // Print job statuses (lowercase)
  const queued = myPrintJobs?.filter(j => j.status === "queued")?.length || 0;
  const printing = myPrintJobs?.filter(j => j.status === "in_printing")?.length || 0;
  const polishing = myPrintJobs?.filter(j => j.status === "polishing")?.length || 0;
  const completed = myPrintJobs?.filter(j => j.status === "completed")?.length || 0;

  const stats = [
    { title: "Queued", value: queued, icon: Clock, color: "bg-gray-500" },
    { title: "Printing", value: printing, icon: Printer, color: "bg-blue-500" },
    { title: "Polishing", value: polishing, icon: Wrench, color: "bg-yellow-500" },
    { title: "Completed", value: completed, icon: CheckCircle, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Printer Dashboard</h1>
        <p className="text-gray-500">Manage your print jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print Jobs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-500" />
            My Print Jobs
          </h2>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : myPrintJobs?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Printer className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p>No print jobs yet</p>
            </div>
          ) : (
            myPrintJobs?.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Job #{job.id}</p>
                    <p className="text-sm text-gray-500">{job.order_number || `Order #${job.order}`}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === "completed" ? "bg-green-100 text-green-700" :
                      job.status === "in_printing" ? "bg-blue-100 text-blue-700" :
                      job.status === "polishing" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {job.status_display || job.status?.replace(/_/g, " ")}
                    </span>
                    {job.progress_percentage > 0 && job.progress_percentage < 100 && (
                      <p className="text-xs text-gray-500 mt-1">{job.progress_percentage}% complete</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrinterDashboard;
