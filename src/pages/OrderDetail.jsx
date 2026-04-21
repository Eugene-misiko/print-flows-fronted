import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {fetchOrder, rejectDesign, startPrintJob, submitDesign,completePrintJob, approveDesign, moveToPolishing, assignDesigner,assignPrinter, startDesign, cancelOrder,} from "@/store/slices/ordersSlice";
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
    <div className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800 transition-colors duration-300">
      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">{title}</h3>
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
      {label && <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full text-left px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none transition-all flex items-center justify-between"
        >
          {selected ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-orange-600/20">
                {selected.first_name?.[0]}{selected.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{selected.first_name} {selected.last_name}</p>
                <p className="text-xs text-stone-400 truncate">{selected.email}</p>
              </div>
            </div>
          ) : (
            <span className="text-stone-400 text-sm">{placeholder || "Select user..."}</span>
          )}
          <svg className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 mt-1.5 w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl max-h-64 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-stone-100 dark:border-stone-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#c2410c]/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filtered?.length === 0 ? (
                  <p className="text-sm text-stone-400 p-4 text-center">No users found</p>
                ) : (
                  filtered.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { onChange(u.id); setOpen(false); setSearch(""); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-colors ${parseInt(value) === u.id ? "bg-[#fff7ed] dark:bg-[#c2410c]/10" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-stone-400 truncate">{u.email}</p>
                      </div>
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
  const { users } = useSelector((s) => s.users);
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

  useEffect(() => {
    if (isAdmin && (showAssignDesigner || showAssignPrinter)) {
      dispatch(fetchUsers());
    }
  }, [isAdmin, showAssignDesigner, showAssignPrinter, dispatch]);

  const designers = users?.filter((u) => u.role === "designer" && u.is_active !== false) || [];
  const printers = users?.filter((u) => u.role === "printer" && u.is_active !== false) || [];

  const action = async (thunk, payload, msg, closeModal, clearFn) => {
    setProcessing(true);
    try { await dispatch(thunk(payload)).unwrap(); toast.success(msg); dispatch(fetchOrder(id)); if (closeModal) closeModal(); if (clearFn) clearFn(); }
    catch (e) { toast.error(typeof e === "string" ? e : e?.detail || "Failed"); }
    finally { setProcessing(false); }
  };

  if (isLoading || !order) return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded-xl w-1/4" />
      <div className="h-64 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
      <div className="h-96 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
    </div>
  );

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
  const canCancel = (isAdmin || user?.role === "client") && !["completed", "cancelled"].includes(order.status);
  const needsPayment = user?.role === "client" && order.invoice && order.invoice.status !== "paid";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-300" />
            </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Order #{order.order_number}</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{fmtDate(order.created_at)} {order.priority !== "normal" && <span className="ml-2 text-xs px-2.5 py-0.5 bg-[#fff7ed] dark:bg-[#c2410c]/15 text-[#c2410c] dark:text-[#ea580c] rounded-lg border border-[#c2410c]/15 dark:border-[#c2410c]/20 uppercase font-bold">
            {order.priority}</span>}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canAssignDesigner && <button onClick={() => setShowAssignDesigner(true)}
           className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm text-sm font-semibold active:scale-[.98] transition-all">
            <UserPlus className="h-4 w-4 mr-1.5 inline" />Assign Designer</button>}
          {(canAssignPrinter || canAssignPrinterNoDesign) && <button onClick={() => setShowAssignPrinter(true)}
           className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm text-sm font-semibold active:scale-[.98] transition-all">
            <UserPlus className="h-4 w-4 mr-1.5 inline" />Assign Printer</button>}
          {canStartDesign && <button onClick={() => action(startDesign, id, "Design started")} disabled={processing} 
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm text-sm font-semibold disabled:opacity-50 active:scale-[.98] transition-all">
            <Play className="h-4 w-4 mr-1.5 inline" />Start Design</button>}
            
          {canSubmitDesign && <button onClick={() => setShowSubmit(true)} 
          className="px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl shadow-lg shadow-orange-600/20 text-sm font-bold active:scale-[.98] transition-all">
            <Upload className="h-4 w-4 mr-1.5 inline" />Submit Design</button>}
          {canApproveReject && <><button onClick={() => action(approveDesign, { id, approved: true }, "Design approved!")} disabled={processing} 
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-sm font-semibold disabled:opacity-50 active:scale-[.98] transition-all">
            <CheckCircle className="h-4 w-4 mr-1.5 inline" />Approve</button><button onClick={() => setShowReject(true)} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm text-sm font-semibold active:scale-[.98] transition-all">
              <XCircle className="h-4 w-4 mr-1.5 inline" />Reject</button></>}
          {canStartPrinting && <button onClick={() => action(startPrintJob, id, "Printing started")} disabled={processing} 
          className="px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl shadow-lg shadow-orange-600/20 text-sm font-bold disabled:opacity-50 active:scale-[.98] transition-all">
            <Play className="h-4 w-4 mr-1.5 inline" />Start Printing</button>}
          {canPolish && <button onClick={() => action(moveToPolishing, id, "Moved to polishing")} disabled={processing}
           className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm text-sm font-semibold disabled:opacity-50 active:scale-[.98] transition-all">
            <CheckSquare className="h-4 w-4 mr-1.5 inline" />Complete Printing</button>}
          {canComplete && <button onClick={() => action(completePrintJob, id, "Order ready for pickup!")} disabled={processing} 
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-sm font-semibold disabled:opacity-50 active:scale-[.98] transition-all">
            <CheckCircle className="h-4 w-4 mr-1.5 inline" />Mark Ready</button>}
          {needsPayment && <button onClick={() => setShowPayment(true)}
           className="px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl shadow-lg shadow-orange-600/20 text-sm font-bold active:scale-[.98] transition-all">
            <CreditCard className="h-4 w-4 mr-1.5 inline" />Pay Invoice</button>}
          {canCancel && <button onClick={() => setShowCancel(true)}
           className="px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/15 text-sm font-semibold active:scale-[.98] transition-all">
            <Ban className="h-4 w-4 mr-1.5 inline" />Cancel</button>}
        </div>
      </div>

      {/* WORKFLOW TRACKER  */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
        <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-8">Order Progress</h2>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-700" />
          {isRejected ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200/70 dark:border-red-800/30 rounded-xl">
              <XCircle className="w-6 h-6 text-red-500" />
              <div><p className="font-semibold text-red-700 dark:text-red-300">Design Rejected</p>{order.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{order.rejection_reason}</p>}</div>
            </div>
          ) : isCancelled ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
              <Ban className="w-6 h-6 text-stone-500" />
              <div><p className="font-semibold text-stone-600 dark:text-stone-300">Order Cancelled</p>{order.cancellation_reason && <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">{order.cancellation_reason}</p>}</div>
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done && !current ? "bg-emerald-500 border-emerald-500 text-white" : current ? "bg-[#c2410c] border-[#c2410c] text-white ring-4 ring-[#c2410c]/20" : "bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-400"}`}>
                      {done && !current ? <CheckCircle className="w-5 h-5" /> : <span>{i + 1}</span>}
                    </div>
                    <p className={`mt-2.5 text-xs text-center max-w-[80px] leading-tight ${current ? "font-bold text-[#c2410c] dark:text-[#ea580c]" : done ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-stone-400 dark:text-stone-600"}`}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {order.assigned_designer && <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-900/15 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
          <User className="w-4 h-4 text-purple-500" /><span className="text-sm font-medium text-purple-700 dark:text-purple-300">
          Designer: {order.designer_name || `User #${order.assigned_designer}`}</span></div>}
          {order.assigned_printer && <div className="flex items-center gap-2 px-3.5 py-2 bg-sky-50 dark:bg-sky-900/15 rounded-xl border border-sky-200/50 dark:border-sky-800/30">
          <User className="w-4 h-4 text-sky-500" /><span className="text-sm font-medium text-sky-700 dark:text-sky-300">
            Printer: {order.printer_name || `User #${order.assigned_printer}`}</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-5">Order Items ({order.items?.length || 0})</h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 transition-colors">
                  <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center flex-shrink-0"><Package className="h-8 w-8 text-stone-400 dark:text-stone-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">{item.product_name || "Product"}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">Qty: <span className="font-bold text-stone-700 dark:text-stone-300">{item.quantity}</span> @ {fmtCurrency(item.unit_price)}</p>
                    {item.field_values?.length > 0 && (<div className="mt-2.5 flex flex-wrap gap-2">{item.field_values.map((fv, j) => (<span key={fv.id || j} className="text-xs bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 font-medium">{fv.field?.name || "Field"}: {fv.value}{fv.file_url && <a href={fv.file_url} target="_blank" rel="noreferrer" className="ml-1 text-[#c2410c]">
                      <Download className="w-3 h-3 inline" /></a>}</span>))}</div>)}
                    {item.specifications && Object.keys(item.specifications).length > 0 && (<div className="mt-2.5 flex flex-wrap gap-2">{Object.entries(item.specifications).map(([k, v]) => (<span key={k} className="text-xs bg-[#fff7ed] dark:bg-[#c2410c]/10 px-2.5 py-1 rounded-lg border border-[#c2410c]/15 dark:border-[#c2410c]/20 text-[#c2410c] dark:text-[#ea580c] font-semibold">{k}: {v}</span>))}</div>)}
                    {item.notes && <p className="mt-2 text-sm text-stone-500 dark:text-stone-500 italic">Note: {item.notes}</p>}
                  </div>
                  <p className="font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">{fmtCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-500 dark:text-stone-400"><span>Subtotal</span><span className="font-medium text-stone-700 dark:text-stone-300">{fmtCurrency(order.subtotal)}</span></div>
              {order.tax > 0 && <div className="flex justify-between text-stone-500 dark:text-stone-400"><span>Tax</span><span className="font-medium text-stone-700 dark:text-stone-300">{fmtCurrency(order.tax)}</span></div>}
              {order.delivery_fee > 0 && <div className="flex justify-between text-stone-500 dark:text-stone-400"><span>Delivery</span><span className="font-medium text-stone-700 dark:text-stone-300">{fmtCurrency(order.delivery_fee)}</span></div>}
              {order.discount > 0 && <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Discount</span><span className="font-medium">-{fmtCurrency(order.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-3 border-t border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100"><span>Total</span><span>{fmtCurrency(order.total_price)}</span></div>
            </div>
          </div>

          {/* Design Section */}
          {order.needs_design && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-5 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500" /> Design Workflow</h2>
              <div className="mb-5 p-4 bg-sky-50 dark:bg-sky-900/10 border border-sky-200/50 dark:border-sky-800/30 rounded-xl">
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-2">Client Provided:</p>
                {order.design_description && <p className="text-sm text-sky-600 dark:text-sky-400">{order.design_description}</p>}
                {order.client_files?.length > 0 && (<div className="mt-2 space-y-1">{order.client_files.map((f, i) => (
                  <a key={i} href={f.url || f} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sky-600">
                 <FileText className="w-3.5 h-3.5" />
                 {f.name || "Download file"}
                  </a>))}</div>)}
                {!order.design_description && order.client_files?.length === 0 && <p className="text-sm text-stone-400">Nothing provided</p>}
              </div>
              {order.design_file ? (
                <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    Designer's Submission:</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <FileText className="h-6 w-6 text-emerald-500" />
                      </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                        Design uploaded</p><p className="text-xs text-stone-400 mt-0.5">
                          {fmtDate(order.design_completed_at)}</p></div>
                          {order.design_file_url ? (
                            <a
                              href={order.design_file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-[#c2410c] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold flex items-center">
                              <Download className="w-3.5 h-3.5 mr-1.5 inline" />
                              View Design 
                            </a>
                          ) : ( 
                            <span className="text-sm text-red-400">No file available</span>
                          )}
                  </div> 
                  {order.design_notes && <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-700">Notes: {order.design_notes}</p>}
                </div>
              ) : (
                <div className="mb-5 p-6 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl text-center border border-stone-100 dark:border-stone-800">
                  <PauseCircle className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto mb-2" />
                  <p className="text-sm text-stone-500 dark:text-stone-500 font-medium">No design submitted yet</p>
                </div>
              )}
              {order.design_revisions > 0 && <p className="text-xs font-semibold text-[#c2410c] dark:text-[#ea580c]">Revisions used: {order.design_revisions}/{order.max_revisions}</p>}
            </div>
          )}

          {/* Invoice */}
          {order.invoice && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Invoice</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800"><p className="text-xs text-stone-400 font-medium">Invoice #</p><p className="font-bold text-stone-800 dark:text-stone-200 mt-1">
                  {order.invoice.invoice_number}</p></div>
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                <p className="text-xs text-stone-400 font-medium">Total</p>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-1">
                  {fmtCurrency(order.invoice.total_amount)}</p></div>
                <div className="p-4 bg-[#fff7ed] dark:bg-[#c2410c]/10 rounded-xl border border-[#c2410c]/15 dark:border-[#c2410c]/20"><p className="text-xs text-stone-400 font-medium">Deposit (70%)</p><p className="font-bold text-[#c2410c] dark:text-[#ea580c] mt-1">{fmtCurrency(order.invoice.deposit_amount)}</p><p className="text-xs text-[#c2410c]/70 mt-0.5">Paid: {fmtCurrency(order.invoice.deposit_paid)}</p></div>
                <div className="p-4 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-200/50 dark:border-sky-800/30"><p className="text-xs text-stone-400 font-medium">Balance</p><p className="font-bold text-sky-600 dark:text-sky-400 mt-1">{fmtCurrency(order.invoice.balance_due)}</p></div>
              </div>
              <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border 
                  ${order.invoice.status === "paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30" : order.invoice.status === "partial" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30" : "bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700"}`}>
                {order.invoice.status_display || order.invoice.status}</span>
                {!order.invoice.is_deposit_paid && <p className="text-xs text-red-500 font-semibold">⚠ Deposit not paid — work cannot start</p>}
                {order.invoice.is_deposit_paid && order.invoice.status !== "paid" && <p className="text-xs text-emerald-600 font-semibold">✓ Deposit paid — work can proceed</p>}
              </div>
            </div>
          )}

          {/* Status History */}
          {order.status_history?.length > 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-6">Activity Log</h2>
              <div className="space-y-0">
                {order.status_history.map((h, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? "bg-[#c2410c] border-[#c2410c]" : "bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"}`} />{i < order.status_history.length - 1 && <div className="w-0.5 h-full bg-stone-200 dark:bg-stone-700 mt-1" />}</div>
                    <div className="flex-1 pb-6"><p className="font-semibold text-stone-800 dark:text-stone-200">{fmt(h.new_status)} {h.changed_by_name && <span className="text-sm text-stone-400 dark:text-stone-500 font-normal">by {h.changed_by_name}</span>}</p><p className="text-sm text-stone-500 dark:text-stone-500 mt-0.5">
                      {fmtDate(h.created_at)}</p>{h.note && <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-800">{h.note}</p>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-5">Client</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#fff7ed] dark:bg-[#c2410c]/15 rounded-full flex items-center justify-center border border-[#c2410c]/15 dark:border-[#c2410c]/20"><User className="h-5 w-5 text-[#c2410c]" /></div><p className="font-bold text-stone-800 dark:text-stone-200">{order.user_name || "Unknown"}</p></div>
              <div className="flex items-center gap-2.5 text-sm text-stone-500 dark:text-stone-400"><Mail className="h-4 w-4" /><span>{order.user?.email || "N/A"}</span></div>
              <div className="flex items-center gap-2.5 text-sm text-stone-500 dark:text-stone-400"><Phone className="h-4 w-4" /><span>{order.user?.phone || "N/A"}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-5">Timeline</h2>
            <div className="space-y-3.5 text-sm">
              {[["Created", order.created_at], ["Design Started", order.design_started_at], ["Design Done", order.design_completed_at], ["Printing", order.printing_started_at], ["Completed", order.completed_at]].map(([l, d]) => d && (
                <div key={l} className="flex justify-between"><span className="text-stone-500 dark:text-stone-500">{l}</span><span className={l === "Completed" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-700 dark:text-stone-300"}>{fmtDate(d)}</span></div>
              ))}
              {order.estimated_completion && <div className="flex justify-between pt-3 border-t border-stone-100 dark:border-stone-800"><span className="text-stone-500 dark:text-stone-500">Est.</span><span className="text-[#c2410c] dark:text-[#ea580c] font-bold">{fmtDate(order.estimated_completion)}</span></div>}
            </div>
          </div>
          {order.transportation && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#c2410c]" />Delivery</h2>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between"><span className="text-stone-500 dark:text-stone-500">Type</span><span className="capitalize font-medium text-stone-700 dark:text-stone-300">{order.transportation.transport_type?.replace("_", " ")}</span></div>
                {order.transportation.delivery_address && <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                <span className="text-stone-600 dark:text-stone-400">{order.transportation.delivery_address}</span></div>}
                {order.transportation.tracking_number && <div className="flex justify-between"><span className="text-stone-500 dark:text-stone-500">Tracking</span>
                <span className="text-[#c2410c] dark:text-[#ea580c] font-bold">{order.transportation.tracking_number}</span></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showAssignDesigner && (
        <Modal title="Assign Designer" onClose={() => setShowAssignDesigner(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Select a designer from your team to work on this order.</p>
          {designers.length === 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/70 dark:border-amber-800/30 rounded-xl text-sm text-amber-700 dark:text-amber-300">
              No active designers found. <button onClick={() => { setShowAssignDesigner(false); navigate("/app/users"); }} className="underline font-bold ml-1">Invite one →</button>
            </div>
          ) : (
            <UserSelect users={designers} value={designerId} onChange={(id) => setDesignerId(id)} placeholder="Select a designer..." label="Designer" />
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAssignDesigner(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">Cancel</button>
            <button onClick={() => { if (!designerId) return toast.error("Select a designer"); 
              action(assignDesigner, { id, designer_id: parseInt(designerId) }, "Designer assigned", setShowAssignDesigner, () => setDesignerId("")); }} disabled={processing || !designerId} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold disabled:opacity-50 active:scale-[.98] transition-all shadow-sm">{processing ? "..." : "Assign"}</button>
          </div>
        </Modal>
      )}

      {showAssignPrinter && (
        <Modal title="Assign Printer" onClose={() => setShowAssignPrinter(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Select a printer from your team to handle this order.</p>
          {printers.length === 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/70 dark:border-amber-800/30 rounded-xl text-sm text-amber-700 dark:text-amber-300">
              No active printers found. <button onClick={() => { setShowAssignPrinter(false); navigate("/app/users"); }} className="underline font-bold ml-1">Invite one →</button>
            </div>
          ) : (
            <UserSelect users={printers} value={printerId} onChange={(id) => setPrinterId(id)} placeholder="Select a printer..." label="Printer" />
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAssignPrinter(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">Cancel</button>
            <button onClick={() => { if (!printerId) return toast.error("Select a printer"); action(assignPrinter, { id, printer_id: parseInt(printerId) }, "Printer assigned", setShowAssignPrinter, () => setPrinterId("")); }} disabled={processing || !printerId} className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold disabled:opacity-50 active:scale-[.98] transition-all shadow-sm">{processing ? "..." : "Assign"}</button>
          </div>
        </Modal>
      )}

      {showReject && (
        <Modal title="Reject Design" onClose={() => setShowReject(false)}>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="What needs to change?" rows={4} className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/40 transition-all mb-5" />
          <div className="flex gap-3">
            <button onClick={() => setShowReject(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">Cancel</button>
            <button onClick={() => { if (!rejectReason.trim()) return toast.error("Provide a reason"); action(rejectDesign, { id, reason: rejectReason }, "Design rejected", setShowReject, () => setRejectReason("")); }} disabled={processing} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50 active:scale-[.98] transition-all">{processing ? "..." : "Reject"}</button>
          </div>
        </Modal>
      )}

      {showSubmit && (
        <Modal title="Submit Design" onClose={() => setShowSubmit(false)}>
          <div className="space-y-5">
            <div><label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Design File *</label><input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai,.psd" onChange={(e) => setDesignFile(e.target.files[0])} className="w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#fff7ed] dark:file:bg-[#c2410c]/15 file:text-[#c2410c] dark:file:text-[#ea580c] hover:file:bg-orange-100 dark:hover:file:bg-[#c2410c]/25 cursor-pointer" /></div>
            <div><label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Notes for client</label><textarea value={designNotes} onChange={(e) => setDesignNotes(e.target.value)} rows={3} placeholder="Describe what you designed..." className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 transition-all" /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowSubmit(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">Cancel</button>
            <button onClick={() => { if (!designFile) return toast.error("Upload a file"); const fd = new FormData(); fd.append("design_file", designFile); fd.append("design_notes", designNotes);
               action(submitDesign, { orderId: id, data: fd }, "Design submitted for review", setShowSubmit, () => { setDesignFile(null); setDesignNotes(""); }); }} disabled={processing} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl font-bold disabled:opacity-50 active:scale-[.98] transition-all shadow-lg shadow-orange-600/20">{processing ? "..." : "Submit"}</button>
          </div>
        </Modal>
      )}

      {showCancel && (
        <Modal title="Cancel Order" onClose={() => setShowCancel(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">This action cannot be undone. Why are you cancelling?</p>
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3} className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/40 transition-all mb-5" />
          <div className="flex gap-3">
            <button onClick={() => setShowCancel(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">Keep Order</button>
            <button onClick={() => { action(cancelOrder, { orderId: id, reason: cancelReason }, "Order cancelled", setShowCancel, () => setCancelReason("")); }} disabled={processing} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50 active:scale-[.98] transition-all">{processing ? "..." : "Cancel Order"}</button>
          </div>
        </Modal>
      )}

      {showPayment && (
        <Modal title="Pay Invoice" onClose={() => setShowPayment(false)}>
          <div className="space-y-5">
            <div className="p-5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Invoice</p>
              <p className="font-bold text-stone-800 dark:text-stone-200 mt-1">{order.invoice.invoice_number}</p>
              <p className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-2 tracking-tight">{fmtCurrency(order.invoice.balance_due)}</p>
            </div>
            {!order.invoice.is_deposit_paid && <p className="text-xs text-[#c2410c] bg-[#fff7ed] dark:bg-[#c2410c]/10 p-3 rounded-xl border border-[#c2410c]/15 dark:border-[#c2410c]/20 font-semibold">⚠ Paying deposit (70%) to start work</p>}
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">M-Pesa Phone</label>
              <div className="flex">
                <span className="px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-r-0 border-stone-200 dark:border-stone-700 rounded-l-xl text-sm font-bold text-stone-600 dark:text-stone-400">+254</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="712345678" className="flex-1 px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-r-xl outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 text-stone-800 dark:text-stone-100 transition-all" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowPayment(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">Cancel</button>
            <button onClick={() => { if (!phone) return toast.error("Enter phone"); action(initiateMpesaPayment, { invoice_id: order.invoice.id, phone_number: `254${phone}` }, "Check your phone for M-Pesa prompt", setShowPayment, () => setPhone("")); }} disabled={processing} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl font-bold disabled:opacity-50 active:scale-[.98] transition-all shadow-lg shadow-orange-600/20">{processing ? "..." : "Pay Now"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderDetail;