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
    { 
      title: "Queued", 
      value: queued, 
      icon: Clock, 
      lightBg: "bg-gray-100",
      darkBg: "dark:bg-gray-700/30",
      iconColor: "text-gray-600 dark:text-gray-400"
    },
    { 
      title: "Printing", 
      value: printing, 
      icon: Printer, 
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      title: "Polishing", 
      value: polishing, 
      icon: Wrench, 
      lightBg: "bg-yellow-50",
      darkBg: "dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400"
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Printer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your print jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Print Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-500" />
            My Print Jobs
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : myPrintJobs?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Printer className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p>No print jobs yet</p>
            </div>
          ) : (
            myPrintJobs?.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Job #{job.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.order_number || `Order #${job.order}`}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === "completed" 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : job.status === "in_printing" 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : job.status === "polishing" 
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" 
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {job.status_display || job.status?.replace(/_/g, " ")}
                    </span>
                    {job.progress_percentage > 0 && job.progress_percentage < 100 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.progress_percentage}% complete</p>
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