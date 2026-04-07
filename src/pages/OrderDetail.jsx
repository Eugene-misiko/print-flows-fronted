import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {fetchOrder, rejectDesign, startPrintJob, submitDesign,
  completePrintJob, approveDesign, moveToPolishing, assignDesigner,
  assignPrinter, startDesign, cancelOrder,
} from "@/store/slices/ordersSlice";
import { fetchUsers } from "@/store/slices/usersSlice"; 
import { initiateMpesaPayment } from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import {
  ArrowLeft, Package, MapPin, User, Phone, Mail,
  CreditCard, FileText, Download, Play, CheckCircle,
  XCircle, Upload, Truck, CheckSquare, AlertCircle, UserPlus,
  PauseCircle, Ban, Search,
} from "lucide-react";

const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";
const fmtCurrency = (a) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(a || 0);

const getSteps = (needsDesign) => needsDesign ? [
  { key: "pending", label: "Order Placed" },
  { key: "assigned_to_designer", label: "Designer Assigned" },
  { key: "design_in_progress", label: "Designing" },
  { key: "design_completed", label: "Client Review" },
  { key: "approved_for_printing", label: "Approved" },
  { key: "printing", label: "Printing" },
  { key: "polishing", label: "Polishing" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "completed", label: "Completed" },
] : [
  { key: "pending", label: "Order Placed" },
  { key: "approved_for_printing", label: "Approved for Print" },
  { key: "printing", label: "Printing" },
  { key: "polishing", label: "Polishing" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "completed", label: "Completed" },
];

const STATUS_ORDER = ["pending", "assigned_to_designer", "design_in_progress", "design_completed", "approved_for_printing", "printing_queued", "printing", "polishing", "ready_for_pickup", "out_for_delivery", "completed"];

// Reusable modal 
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

// User Select Dropdown with Search 
const UserSelect = ({ users, value, onChange, placeholder, label }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const selected = users?.find((u) => u.id === parseInt(value));

  const filtered = users?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {/* Selected display trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors flex items-center justify-between"
        >
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {selected.first_name?.[0]}{selected.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{selected.first_name} {selected.last_name}</p>
                <p className="text-xs text-gray-400 truncate">{selected.email}</p>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-sm">{placeholder || "Select user..."}</span>
          )}
          <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {/* Dropdown */}
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
              </div>
              {/* Options */}
              <div className="overflow-y-auto flex-1">
                {filtered?.length === 0 ? (
                  <p className="text-sm text-gray-400 p-3 text-center">No users found</p>
                ) : (
                  filtered.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { onChange(u.id); setOpen(false); setSearch(""); }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${parseInt(value) === u.id ? "bg-orange-50 dark:bg-orange-900/20" : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">ID: {u.id}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentOrder: order, isLoading } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);
  const { users } = useSelector((s) => s.users); // <-- ADD THIS
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  const [showReject, setShowReject] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showAssignDesigner, setShowAssignDesigner] = useState(false);
  const [showAssignPrinter, setShowAssignPrinter] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [designFile, setDesignFile] = useState(null);
  const [designNotes, setDesignNotes] = useState("");
  const [designerId, setDesignerId] = useState("");
  const [printerId, setPrinterId] = useState("");
  const [phone, setPhone] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { dispatch(fetchOrder(id)); }, [dispatch, id]);

  // Fetch users when admin opens assign modals
  useEffect(() => {
    if (isAdmin && (showAssignDesigner || showAssignPrinter)) {
      dispatch(fetchUsers());
    }
  }, [isAdmin, showAssignDesigner, showAssignPrinter, dispatch]);

  // Filter users by role
  const designers = users?.filter((u) => u.role === "designer" && u.is_active !== false) || [];
  const printers = users?.filter((u) => u.role === "printer" && u.is_active !== false) || [];

  const action = async (thunk, payload, msg, closeModal, clearFn) => {
    setProcessing(true);
    try { await dispatch(thunk(payload)).unwrap(); toast.success(msg); dispatch(fetchOrder(id)); if (closeModal) closeModal(); if (clearFn) clearFn(); }
    catch (e) { toast.error(typeof e === "string" ? e : e?.detail || "Failed"); }
    finally { setProcessing(false); }
  };

  if (isLoading || !order) return (<div className="animate-pulse space-y-6"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" /></div>);

  const steps = getSteps(order.needs_design);
  const currentIdx = steps.findIndex((s) => s.key === order.status);
  const isRejected = order.status === "design_rejected";
  const isCancelled = order.status === "cancelled";

  const canAssignDesigner = isAdmin && order.status === "pending" && order.needs_design && !order.assigned_designer;
  const canAssignPrinter = isAdmin && order.status === "approved_for_printing" && !order.assigned_printer;
  const canAssignPrinterNoDesign = isAdmin && order.status === "pending" && !order.needs_design && !order.assigned_printer;
  const canStartDesign = user?.role === "designer" && (order.status === "assigned_to_designer" || order.status === "design_rejected");
  const canSubmitDesign = user?.role === "designer" && order.status === "design_in_progress";
  const canApproveReject = user?.role === "client" && order.status === "design_completed";
  const canStartPrinting = user?.role === "printer" && (order.status === "approved_for_printing" || order.status === "printing_queued");
  const canPolish = user?.role === "printer" && order.status === "printing";
  const canComplete = user?.role === "printer" && order.status === "polishing";
  const canCancel = (isAdmin || user?.role === "client") && ["pending", "assigned_to_designer"].includes(order.status);
  const needsPayment = user?.role === "client" && order.invoice && order.invoice.status !== "paid";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.order_number}</h1>
            <p className="text-gray-500">{fmtDate(order.created_at)} {order.priority !== "normal" && <span className="ml-2 text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full uppercase font-medium">{order.priority}</span>}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAssignDesigner && <button onClick={() => setShowAssignDesigner(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm text-sm"><UserPlus className="h-4 w-4 mr-1.5 inline" />Assign Designer</button>}
          {(canAssignPrinter || canAssignPrinterNoDesign) && <button onClick={() => setShowAssignPrinter(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 shadow-sm text-sm"><UserPlus className="h-4 w-4 mr-1.5 inline" />Assign Printer</button>}
          {canStartDesign && <button onClick={() => action(startDesign, id, "Design started")} disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm text-sm disabled:opacity-50"><Play className="h-4 w-4 mr-1.5 inline" />Start Design</button>}
          {canSubmitDesign && <button onClick={() => setShowSubmit(true)} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm text-sm"><Upload className="h-4 w-4 mr-1.5 inline" />Submit Design</button>}
          {canApproveReject && <><button onClick={() => action(approveDesign, { id, approved: true }, "Design approved!")} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm text-sm disabled:opacity-50"><CheckCircle className="h-4 w-4 mr-1.5 inline" />Approve</button><button onClick={() => setShowReject(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm text-sm"><XCircle className="h-4 w-4 mr-1.5 inline" />Reject</button></>}
          {canStartPrinting && <button onClick={() => action(startPrintJob, id, "Printing started")} disabled={processing} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm text-sm disabled:opacity-50"><Play className="h-4 w-4 mr-1.5 inline" />Start Printing</button>}
          {canPolish && <button onClick={() => action(moveToPolishing, id, "Moved to polishing")} disabled={processing} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-sm text-sm disabled:opacity-50"><CheckSquare className="h-4 w-4 mr-1.5 inline" />Complete Printing</button>}
          {canComplete && <button onClick={() => action(completePrintJob, id, "Order ready for pickup!")} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm text-sm disabled:opacity-50"><CheckCircle className="h-4 w-4 mr-1.5 inline" />Mark Ready</button>}
          {needsPayment && <button onClick={() => setShowPayment(true)} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm text-sm"><CreditCard className="h-4 w-4 mr-1.5 inline" />Pay Invoice</button>}
          {canCancel && <button onClick={() => setShowCancel(true)} className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"><Ban className="h-4 w-4 mr-1.5 inline" />Cancel</button>}
        </div>
      </div>

      {/* WORKFLOW TRACKER  */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Order Progress</h2>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
          {isRejected ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
              <div><p className="font-medium text-red-700 dark:text-red-300">Design Rejected</p>{order.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400">{order.rejection_reason}</p>}</div>
            </div>
          ) : isCancelled ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              <Ban className="w-6 h-6 text-gray-500" />
              <div><p className="font-medium text-gray-700 dark:text-gray-300">Order Cancelled</p>{order.cancellation_reason && <p className="text-sm text-gray-500">{order.cancellation_reason}</p>}</div>
            </div>
          ) : (
            <div className="relative flex justify-between">
              {steps.map((step, i) => {
                const statusIdx = STATUS_ORDER.indexOf(order.status);
                const stepIdx = STATUS_ORDER.indexOf(step.key);
                const done = statusIdx >= stepIdx;
                const current = order.status === step.key;
                return (
                  <div key={step.key} className="flex flex-col items-center z-10" style={{ flex: 1 }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done && !current ? "bg-green-500 border-green-500 text-white" : current ? "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-200 dark:ring-orange-900/50" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"}`}>
                      {done && !current ? <CheckCircle className="w-5 h-5" /> : <span>{i + 1}</span>}
                    </div>
                    <p className={`mt-2 text-xs text-center max-w-[80px] ${current ? "font-semibold text-orange-600 dark:text-orange-400" : done ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400"}`}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          {order.assigned_designer && <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"><User className="w-4 h-4 text-purple-500" /><span className="text-purple-700 dark:text-purple-300">Designer: {order.designer_name || `User #${order.assigned_designer}`}</span></div>}
          {order.assigned_printer && <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800"><User className="w-4 h-4 text-cyan-500" /><span className="text-cyan-700 dark:text-cyan-300">Printer: {order.printer_name || `User #${order.assigned_printer}`}</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items ({order.items?.length || 0})</h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0"><Package className="h-8 w-8 text-gray-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product_name || "Product"}</p>
                    <p className="text-sm text-gray-500">Qty: <span className="font-medium">{item.quantity}</span> @ {fmtCurrency(item.unit_price)}</p>
                    {item.field_values?.length > 0 && (<div className="mt-2 flex flex-wrap gap-2">{item.field_values.map((fv, j) => (<span key={fv.id || j} className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500">{fv.field?.name || "Field"}: {fv.value}{fv.file_url && <a href={fv.file_url} target="_blank" rel="noreferrer" className="ml-1 text-orange-500"><Download className="w-3 h-3 inline" /></a>}</span>))}</div>)}
                    {item.specifications && Object.keys(item.specifications).length > 0 && (<div className="mt-2 flex flex-wrap gap-2">{Object.entries(item.specifications).map(([k, v]) => (<span key={k} className="text-xs bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">{k}: {v}</span>))}</div>)}
                    {item.notes && <p className="mt-2 text-sm text-gray-500 italic">Note: {item.notes}</p>}
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmtCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmtCurrency(order.subtotal)}</span></div>
              {order.tax > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span>{fmtCurrency(order.tax)}</span></div>}
              {order.delivery_fee > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Delivery</span><span>{fmtCurrency(order.delivery_fee)}</span></div>}
              {order.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{fmtCurrency(order.discount)}</span></div>}
              <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>{fmtCurrency(order.total_price)}</span></div>
            </div>
          </div>

          {/* Design Section */}
          {order.needs_design && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500" /> Design Workflow</h2>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Client Provided:</p>
                {order.design_description && <p className="text-sm text-blue-600 dark:text-blue-400">{order.design_description}</p>}
                {order.client_files?.length > 0 && (<div className="mt-2 space-y-1">{order.client_files.map((f, i) => (<p key={i} className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1"><FileText className="w-3 h-3" />{f.name || f}</p>))}</div>)}
                {!order.design_description && order.client_files?.length === 0 && <p className="text-sm text-gray-400">Nothing provided</p>}
              </div>
              {order.design_file ? (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Designer's Submission:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center"><FileText className="h-6 w-6 text-green-500" /></div>
                    <div className="flex-1"><p className="text-sm font-medium">Design uploaded</p><p className="text-xs text-gray-500">{fmtDate(order.design_completed_at)}</p></div>
                    <a href={order.design_file} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"><Download className="w-3 h-3 mr-1 inline" />View</a>
                  </div>
                  {order.design_notes && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded">Notes: {order.design_notes}</p>}
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <PauseCircle className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-500">No design submitted yet</p>
                </div>
              )}
              {order.design_revisions > 0 && <p className="text-xs text-orange-600 dark:text-orange-400">Revisions used: {order.design_revisions}/{order.max_revisions}</p>}
            </div>
          )}

          {/* Invoice */}
          {order.invoice && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-green-500" /> Invoice</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-gray-500">Invoice #</p><p className="font-medium">{order.invoice.invoice_number}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-gray-500">Total</p><p className="font-medium">{fmtCurrency(order.invoice.total_amount)}</p></div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"><p className="text-gray-500">Deposit (70%)</p><p className="font-medium text-orange-600">{fmtCurrency(order.invoice.deposit_amount)}</p><p className="text-xs text-orange-500">Paid: {fmtCurrency(order.invoice.deposit_paid)}</p></div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><p className="text-gray-500">Balance</p><p className="font-medium text-blue-600">{fmtCurrency(order.invoice.balance_due)}</p></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.invoice.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : order.invoice.status === "partial" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{order.invoice.status_display || order.invoice.status}</span>
                {!order.invoice.is_deposit_paid && <p className="text-xs text-red-500 font-medium">⚠ Deposit not paid — work cannot start</p>}
                {order.invoice.is_deposit_paid && order.invoice.status !== "paid" && <p className="text-xs text-green-600">✓ Deposit paid — work can proceed</p>}
              </div>
            </div>
          )}

          {/* Status History */}
          {order.status_history?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
              <div className="space-y-4">
                {order.status_history.map((h, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"}`} />{i < order.status_history.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />}</div>
                    <div className="flex-1 pb-4"><p className="font-medium">{fmt(h.new_status)} {h.changed_by_name && <span className="text-sm text-gray-500 font-normal">by {h.changed_by_name}</span>}</p><p className="text-sm text-gray-500">{fmtDate(h.created_at)}</p>{h.note && <p className="text-sm text-gray-600 mt-1 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">{h.note}</p>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold mb-4">Client</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-orange-600" /></div><p className="font-medium">{order.user_name || "Unknown"}</p></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4" /><span>{order.user?.email || "N/A"}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /><span>{order.user?.phone || "N/A"}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">{[["Created", order.created_at], ["Design Started", order.design_started_at], ["Design Done", order.design_completed_at], ["Printing", order.printing_started_at], ["Completed", order.completed_at]].map(([l, d]) => d && <div key={l} className="flex justify-between"><span className="text-gray-500">{l}</span><span className={l === "Completed" ? "text-green-600 font-medium" : ""}>{fmtDate(d)}</span></div>)}
              {order.estimated_completion && <div className="flex justify-between pt-2 border-t"><span className="text-gray-500">Est.</span><span className="text-orange-600 font-medium">{fmtDate(order.estimated_completion)}</span></div>}
            </div>
          </div>
          {order.transportation && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-orange-500" />Delivery</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{order.transportation.transport_type?.replace("_", " ")}</span></div>
                {order.transportation.delivery_address && <div className="flex items-start gap-2"><MapPin className="h-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /><span className="text-gray-600">{order.transportation.delivery_address}</span></div>}
                {order.transportation.tracking_number && <div className="flex justify-between"><span className="text-gray-500">Tracking</span><span className="text-orange-600 font-medium">{order.transportation.tracking_number}</span></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/*  MODALS */}

      {/* Assign Designer —  WITH USER DROPDOWN */}
      {showAssignDesigner && (
        <Modal title="Assign Designer" onClose={() => setShowAssignDesigner(false)}>
          <p className="text-sm text-gray-500 mb-1">Select a designer from your team to work on this order.</p>
          {designers.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              No active designers found. <button onClick={() => { setShowAssignDesigner(false); navigate("/users"); }} className="underline font-medium">Invite one →</button>
            </div>
          ) : (
            <UserSelect
              users={designers}
              value={designerId}
              onChange={(id) => setDesignerId(id)}
              placeholder="Select a designer..."
              label="Designer"
            />
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAssignDesigner(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={() => { if (!designerId) return toast.error("Select a designer"); action(assignDesigner, { id, designer_id: parseInt(designerId) }, "Designer assigned", setShowAssignDesigner, () => setDesignerId("")); }} disabled={processing || !designerId} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">{processing ? "..." : "Assign"}</button>
          </div>
        </Modal>
      )}

      {/* Assign Printer —  WITH USER DROPDOWN */}
      {showAssignPrinter && (
        <Modal title="Assign Printer" onClose={() => setShowAssignPrinter(false)}>
          <p className="text-sm text-gray-500 mb-1">Select a printer from your team to handle this order.</p>
          {printers.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              No active printers found. <button onClick={() => { setShowAssignPrinter(false); navigate("/users"); }} className="underline font-medium">Invite one →</button>
            </div>
          ) : (
            <UserSelect
              users={printers}
              value={printerId}
              onChange={(id) => setPrinterId(id)}
              placeholder="Select a printer..."
              label="Printer"
            />
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAssignPrinter(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={() => { if (!printerId) return toast.error("Select a printer"); action(assignPrinter, { id, printer_id: parseInt(printerId) }, "Printer assigned", setShowAssignPrinter, () => setPrinterId("")); }} disabled={processing || !printerId} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">{processing ? "..." : "Assign"}</button>
          </div>
        </Modal>
      )}

      {/* Reject */}
      {showReject && (
        <Modal title="Reject Design" onClose={() => setShowReject(false)}>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="What needs to change?" rows={4} className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 mb-4" />
          <div className="flex gap-3"><button onClick={() => setShowReject(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button><button onClick={() => { if (!rejectReason.trim()) return toast.error("Provide a reason"); action(rejectDesign, { id, reason: rejectReason }, "Design rejected", setShowReject, () => setRejectReason("")); }} disabled={processing} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">{processing ? "..." : "Reject"}</button></div>
        </Modal>
      )}

      {/* Submit Design */}
      {showSubmit && (
        <Modal title="Submit Design" onClose={() => setShowSubmit(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Design File *</label><input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai,.psd" onChange={(e) => setDesignFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700" /></div>
            <div><label className="block text-sm font-medium mb-1">Notes for client</label><textarea value={designNotes} onChange={(e) => setDesignNotes(e.target.value)} rows={3} placeholder="Describe what you designed..." className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" /></div>
          </div>
          <div className="flex gap-3 mt-4"><button onClick={() => setShowSubmit(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button><button onClick={() => { if (!designFile) return toast.error("Upload a file"); const fd = new FormData(); fd.append("design_file", designFile); fd.append("design_notes", designNotes); action(submitDesign, { id, data: fd }, "Design submitted for review", setShowSubmit, () => { setDesignFile(null); setDesignNotes(""); }); }} disabled={processing} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg disabled:opacity-50">{processing ? "..." : "Submit"}</button></div>
        </Modal>
      )}

      {/* Cancel */}
      {showCancel && (
        <Modal title="Cancel Order" onClose={() => setShowCancel(false)}>
          <p className="text-sm text-gray-500 mb-4">This action cannot be undone. Why are you cancelling?</p>
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3} className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 mb-4" />
          <div className="flex gap-3"><button onClick={() => setShowCancel(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Keep Order</button><button onClick={() => { action(cancelOrder, { id, reason: cancelReason }, "Order cancelled", setShowCancel, () => setCancelReason("")); }} disabled={processing} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">{processing ? "..." : "Cancel Order"}</button></div>
        </Modal>
      )}

      {/* Payment */}
      {showPayment && (
        <Modal title="Pay Invoice" onClose={() => setShowPayment(false)}>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"><p className="text-sm text-gray-500">Invoice</p><p className="font-medium">{order.invoice.invoice_number}</p><p className="text-2xl font-bold mt-1">{fmtCurrency(order.invoice.balance_due)}</p></div>
            {!order.invoice.is_deposit_paid && <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">⚠ Paying deposit (70%) to start work</p>}
            <div><label className="block text-sm font-medium mb-1">M-Pesa Phone</label>
            <div className="flex">
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-lg">+254</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="712345678" className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-r-lg outline-none focus:ring-2 focus:ring-orange-500" /></div></div>
          </div>
          <div className="flex gap-3 mt-6"><button onClick={() => setShowPayment(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button><button onClick={() => { if (!phone) return toast.error("Enter phone"); action(initiateMpesaPayment, { invoice_id: order.invoice.id, phone_number: `254${phone}` }, "Check your phone for M-Pesa prompt", setShowPayment, () => setPhone("")); }} disabled={processing} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg disabled:opacity-50">{processing ? "..." : "Pay Now"}</button></div>
        </Modal>
      )}
    </div>
  );
};

export default OrderDetail;