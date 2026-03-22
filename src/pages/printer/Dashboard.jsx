import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Printer,
  Clock,
  CheckCircle,
  Package,
  ArrowRight,
  Play,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { fetchPrinterDashboard, startPrinting, completePrinting } from "../../store/slices/ordersSlice";
import toast from "react-hot-toast";

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { printerDashboard, isLoading } = useSelector((state) => state.orders);

  const [processingJob, setProcessingJob] = useState(null);

  useEffect(() => {
    dispatch(fetchPrinterDashboard());
  }, [dispatch]);

  const stats = printerDashboard?.stats || {
    pending_jobs: 0,
    in_progress: 0,
    completed_today: 0,
    queue_position: 0,
  };

  const pendingJobs = printerDashboard?.pending_jobs || [];
  const inProgressJobs = printerDashboard?.in_progress_jobs || [];
  const completedJobs = printerDashboard?.completed_jobs || [];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      ASSIGNED: "bg-blue-100 text-blue-700",
      IN_PROGRESS: "bg-indigo-100 text-indigo-700",
      COMPLETED: "bg-green-100 text-green-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartPrinting = async (jobId) => {
    setProcessingJob(jobId);
    try {
      await dispatch(startPrinting(jobId)).unwrap();
      toast.success("Printing started!");
      dispatch(fetchPrinterDashboard());
    } catch (error) {
      toast.error(error || "Failed to start printing");
    } finally {
      setProcessingJob(null);
    }
  };

  const handleCompletePrinting = async (jobId) => {
    setProcessingJob(jobId);
    try {
      await dispatch(completePrinting(jobId)).unwrap();
      toast.success("Printing completed!");
      dispatch(fetchPrinterDashboard());
    } catch (error) {
      toast.error(error || "Failed to complete printing");
    } finally {
      setProcessingJob(null);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Printer Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.full_name?.split(" ")[0] || "Printer"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Jobs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pending_jobs}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.in_progress}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Printer className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.completed_today}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Queue Position */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Queue Position</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                #{stats.queue_position || "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Jobs */}
      {inProgressJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Currently Printing</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {inProgressJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 bg-indigo-50/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        #{job.order?.order_number}
                      </span>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Product: {job.order?.items?.[0]?.product?.name || "N/A"}</span>
                      <span>•</span>
                      <span>Quantity: {job.quantity || "N/A"}</span>
                      <span>•</span>
                      <span>Started: {formatDate(job.started_at)}</span>
                    </div>
                    {job.specifications && (
                      <div className="mt-2 p-3 bg-white rounded-lg text-sm text-gray-600">
                        <strong>Specs:</strong> {job.specifications}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleCompletePrinting(job.order?.id)}
                    disabled={processingJob === job.order?.id}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {processingJob === job.order?.id ? (
                      "Processing..."
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Complete Printing
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Print Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pending Print Jobs</h2>
          <Link
            to="/print-jobs"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingJobs.length > 0 ? (
            pendingJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/orders/${job.order?.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                      >
                        #{job.order?.order_number}
                      </Link>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Product: {job.order?.items?.[0]?.product?.name || "N/A"}</span>
                      <span>•</span>
                      <span>Quantity: {job.quantity || "N/A"}</span>
                      <span>•</span>
                      <span>Priority: {job.priority || "Normal"}</span>
                    </div>
                    {job.specifications && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <strong>Specs:</strong> {job.specifications}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartPrinting(job.order?.id)}
                    disabled={processingJob === job.order?.id}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                  >
                    {processingJob === job.order?.id ? (
                      "Processing..."
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Printing
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Printer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pending print jobs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrinterDashboard;