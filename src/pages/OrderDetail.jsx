import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, Clock, MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Download,
  Play,
  CheckCircle,
  XCircle,
  Upload,
  Truck,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { fetchOrder, rejectDesign, startPrintJob, submitDesign, completePrintJob, approveDesign, moveToPolishing } from "@/store/slices/ordersSlice";
import { initiateMpesaPayment } from "@/store/slices/paymentsSlice";
import { toast } from "react-hot-toast";

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentOrder, isLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [designFile, setDesignFile] = useState(null);
  const [designNotes, setDesignNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
      PENDING_DESIGN: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
      DESIGN_IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700",
      DESIGN_SUBMITTED: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700",
      DESIGN_APPROVED: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
      DESIGN_REJECTED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
      AWAITING_PRINT: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700",
      PRINTING: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
      PRINTING_COMPLETED: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700",
      POLISHING: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
      COMPLETED: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
      CANCELLED: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Action handlers
  const handleSubmitDesign = async () => {
    if (!designFile) {
      toast.error("Please upload a design file");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("design_file", designFile);
      formData.append("notes", designNotes);
      await dispatch(submitDesign({ id, data: formData })).unwrap();
      toast.success("Design submitted successfully!");
      setShowSubmitModal(false);
      setDesignFile(null);
      setDesignNotes("");
      dispatch(fetchOrder(id));
    } catch (error) {
      toast.error(error || "Failed to submit design");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveDesign = async () => {
    setIsProcessing(true);
    try {
      await dispatch(approveDesign(id)).unwrap();
      toast.success("Design approved!");
      dispatch(fetchOrder(id));
    } catch (error) {
      toast.error(error || "Failed to approve design");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDesign = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    setIsProcessing(true);
    try {
      await dispatch(rejectDesign({ id, reason: rejectReason })).unwrap();
      toast.success("Design rejected");
      setShowRejectModal(false);
      setRejectReason("");
      dispatch(fetchOrder(id));
    } catch (error) {
      toast.error(error || "Failed to reject design");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPrinting = async () => {
    setIsProcessing(true);
    try {
      await dispatch(startPrintJob(id)).unwrap();
      toast.success("Printing started!");
      dispatch(fetchOrder(id));
    } catch (error) {
      toast.error(error || "Failed to start printing");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePrinting = async () => {
    setIsProcessing(true);
    try {
      await dispatch(moveToPolishing(id)).unwrap();
      toast.success("Printing completed!");
      dispatch(fetchOrder(id));
    } catch (error) {
      toast.error(error || "Failed to complete printing");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    try {
      await dispatch(completePrintJob(id)).unwrap();
      toast.success("Order completed!");
      dispatch(fetchOrder(id));
    } catch (error) {
      toast.error(error || "Failed to complete order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await dispatch(
        initiateMpesaPayment({
          invoice_id: currentOrder?.invoice?.id,
          phone_number: `254${phoneNumber}`,
        })
      ).unwrap();
      toast.success("Check your phone for M-Pesa prompt");
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !currentOrder) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  const canSubmitDesign = user?.role === "designer" &&
    ["PENDING_DESIGN", "DESIGN_REJECTED"].includes(currentOrder.status);

  const canApproveReject = user?.role === "client" &&
    currentOrder.status === "DESIGN_SUBMITTED";

  const canStartPrinting = user?.role === "printer" &&
    currentOrder.status === "AWAITING_PRINT";

  const canCompletePrinting = user?.role === "printer" &&
    currentOrder.status === "printing";

  const canCompleteOrder = user?.role === "printer" &&
    currentOrder.status === "polishing";

  const needsPayment = user?.role === "client" &&
    currentOrder.invoice &&
    !currentOrder.invoice.is_paid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{currentOrder.order_number}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Created on {formatDate(currentOrder.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canSubmitDesign && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm transition-all"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Design
            </button>
          )}
          {canApproveReject && (
            <>
              <button
                onClick={handleApproveDesign}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-sm transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Design
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
            </>
          )}

          {canStartPrinting && (
            <button
              onClick={handleStartPrinting}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 shadow-sm transition-all"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Printing
            </button>
          )}

          {canCompletePrinting && (
            <button
              onClick={handleCompletePrinting}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Complete Printing
            </button>
          )}

          {canCompleteOrder && (
            <button
              onClick={handleCompleteOrder}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Order
            </button>
          )}

          {needsPayment && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm transition-all"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-xl p-4 border ${getStatusColor(currentOrder.status)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">
                Status: {currentOrder.status?.replace(/_/g, " ")}
              </p>
              <p className="text-sm opacity-80">
                {currentOrder.status === "pending" && "Waiting for processing"}
                {currentOrder.status === "pending_design" && "Waiting for designer assignment"}
                {currentOrder.status === "design_in_progress" && "Designer is working on your design"}
                {currentOrder.status === "design_submitted" && "Design ready for your review"}
                {currentOrder.status === "awaiting_print" && "Ready for printing"}
                {currentOrder.status === "printing" && "Currently being printed"}
                {currentOrder.status === "polishing" && "Final touches being applied"}
                {currentOrder.status === "completed" && "Order is ready!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {currentOrder.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    {item.field_values?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.field_values.map((fv, i) => (
                          <span
                            key={i}
                            className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200"
                          >
                            {fv.field_name}: {fv.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(currentOrder.subtotal)}</span>
              </div>
              {currentOrder.transportation && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(currentOrder.transportation.cost || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
                <span>Total</span>
                <span>{formatCurrency(currentOrder.total_price)}</span>
              </div>
            </div>
          </div>

          {/* Design */}
          {currentOrder.needs_design && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Design</h2>
              {currentOrder.design_file ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Design file uploaded</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploaded on {formatDate(currentOrder.design_uploaded_at)}
                    </p>
                  </div>
                  <a
                    href={currentOrder.design_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No design uploaded yet</p>
              )}
              {currentOrder.design_notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <strong>Notes:</strong> {currentOrder.design_notes}
                </div>
              )}
            </div>
          )}

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status History</h2>
            <div className="space-y-4">
              {currentOrder.status_history?.map((history, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${index === 0 ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                    />
                    {index < currentOrder.status_history.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {history.status?.replace(/_/g, " ")} 
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(history.created_at)}</p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currentOrder.client?.full_name || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{currentOrder.client?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>{currentOrder.client?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Transportation */}
          {currentOrder.transportation && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentOrder.transportation.mode === "DELIVERY"
                      ? "Delivery"
                      : "Pickup"}
                  </span>
                </div>
                {currentOrder.transportation.mode === "DELIVERY" && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {currentOrder.transportation.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice */}
          {currentOrder.invoice && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Invoice #</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentOrder.invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount Due</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(currentOrder.invoice.amount_due)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span
                    className={`font-medium ${currentOrder.invoice.is_paid ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                      }`}>
                    {currentOrder.invoice.is_paid ? "Paid" : "Pending"}
                  </span>
                </div>
                {!currentOrder.invoice.is_paid && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm transition-all"
                  >
                    Pay with M-Pesa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Design</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please explain what needs to be changed..."
              rows={4}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleRejectDesign}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? "Processing..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Design Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setShowSubmitModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Design</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Design File *
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.psd"
                  onChange={(e) => setDesignFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 dark:file:bg-orange-900/30 file:text-orange-700 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/50 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  placeholder="Add any notes about the design..."
                  rows={3}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDesign}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all"
              >
                {isProcessing ? "Submitting..." : "Submit Design"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pay with M-Pesa</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount to pay</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentOrder?.invoice?.amount_due || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-lg text-gray-600 dark:text-gray-300">
                    +254
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="712345678"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-r-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all">
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;