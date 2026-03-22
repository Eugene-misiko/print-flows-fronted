import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Palette,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  Upload,
  MessageSquare,
} from "lucide-react";
import { fetchDesignerDashboard } from "../../store/slices/ordersSlice";
import { submitDesign } from "../../store/slices/ordersSlice";
import toast from "react-hot-toast";

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { designerDashboard, isLoading } = useSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [designFile, setDesignFile] = useState(null);
  const [designNotes, setDesignNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDesignerDashboard());
  }, [dispatch]);

  const stats = designerDashboard?.stats || {
    pending_designs: 0,
    in_progress: 0,
    completed_today: 0,
    rejected: 0,
  };

  const pendingOrders = designerDashboard?.pending_orders || [];
  const inProgressOrders = dashboardData?.in_progress_orders || [];

  const getStatusColor = (status) => {
    const colors = {
      PENDING_DESIGN: "bg-purple-100 text-purple-700",
      DESIGN_IN_PROGRESS: "bg-indigo-100 text-indigo-700",
      DESIGN_REJECTED: "bg-red-100 text-red-700",
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

  const handleSubmitDesign = async () => {
    if (!designFile) {
      toast.error("Please upload a design file");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("design_file", designFile);
      formData.append("notes", designNotes);

      await dispatch(submitDesign({ id: selectedOrder.id, data: formData })).unwrap();
      toast.success("Design submitted successfully!");
      setShowModal(false);
      setSelectedOrder(null);
      setDesignFile(null);
      setDesignNotes("");
      dispatch(fetchDesignerDashboard());
    } catch (error) {
      toast.error(error || "Failed to submit design");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmitModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.full_name?.split(" ")[0] || "Designer"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Designs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Designs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pending_designs}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-purple-600" />
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
              <Clock className="h-6 w-6 text-indigo-600" />
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

        {/* Rejected */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.rejected}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Design Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pending Design Tasks</h2>
          <Link
            to="/design-tasks"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                      >
                        #{order.order_number}
                      </Link>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Client: {order.client?.full_name || "Unknown"}</span>
                      <span>•</span>
                      <span>Product: {order.items?.[0]?.product?.name || "N/A"}</span>
                      <span>•</span>
                      <span>Created: {formatDate(order.created_at)}</span>
                    </div>
                    {order.design_notes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <strong>Notes:</strong> {order.design_notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    <button
                      onClick={() => openSubmitModal(order)}
                      className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-700"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Submit Design
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pending design tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Design Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit Design for #{selectedOrder.order_number}
            </h3>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design File *
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.psd"
                  onChange={(e) => setDesignFile(e.target.files[0])}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, PNG, JPG, AI, PSD
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  placeholder="Add any notes about the design..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitDesign}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Design"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerDashboard;