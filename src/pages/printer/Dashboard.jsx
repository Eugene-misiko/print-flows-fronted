import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyPrintJobs } from "../../store/slices/ordersSlice";
import { Printer, Clock, CheckCircle, Wrench } from "lucide-react";

const STATUS_BADGES = {
  queued: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  in_printing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  polishing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { myPrintJobs, isLoading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyPrintJobs()); }, [dispatch]);

  const queued = myPrintJobs?.filter((j) => j.status === "queued")?.length || 0;
  const printing = myPrintJobs?.filter((j) => j.status === "in_printing")?.length || 0;
  const polishing = myPrintJobs?.filter((j) => j.status === "polishing")?.length || 0;
  const completed = myPrintJobs?.filter((j) => j.status === "completed")?.length || 0;

  const stats = [
    { title: "Queued", value: queued, icon: Clock, bg: "bg-gray-100 dark:bg-gray-700/30", color: "text-gray-600 dark:text-gray-400" },
    { title: "Printing", value: printing, icon: Printer, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    { title: "Polishing", value: polishing, icon: Wrench, bg: "bg-yellow-50 dark:bg-yellow-900/30", color: "text-yellow-600 dark:text-yellow-400" },
    { title: "Completed", value: completed, icon: CheckCircle, bg: "bg-green-50 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Printer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your print jobs</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Printer className="w-5 h-5 text-cyan-500" /> My Print Jobs
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : myPrintJobs?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Printer className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p>No print jobs yet</p>
            </div>
          ) : (
            myPrintJobs.map((job) => (
              <Link key={job.id} to={`/app/orders/${job.order}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Job #{job.id}</p>
                  <p className="text-sm text-gray-500">{job.order_number || `Order #${job.order}`}</p>
                  {job.progress_percentage > 0 && job.progress_percentage < 100 && (
                    <div className="mt-2 w-32 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${job.progress_percentage}%` }} />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[job.status] || STATUS_BADGES.queued}`}>
                    {job.status_display || fmt(job.status)}
                  </span>
                  {job.progress_percentage > 0 && job.progress_percentage < 100 && (
                    <p className="text-xs text-gray-500 mt-1">{job.progress_percentage}%</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrinterDashboard;