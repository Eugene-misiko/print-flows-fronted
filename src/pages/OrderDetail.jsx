import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchOrder, rejectDesign, startPrintJob, submitDesign,
  completePrintJob, approveDesign, moveToPolishing, assignDesigner,
  assignPrinter, startDesign, cancelOrder, markDelivered,
  markOutForDelivery, createTransportation, clearError, clearSuccess,
} from "@/store/slices/ordersSlice";
import { fetchUsers } from "@/store/slices/usersSlice";
import { initiateMpesaPayment } from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import {
  ArrowLeft, Package, MapPin, User, Phone, Mail,
  CreditCard, FileText, Download, Play, CheckCircle,
  XCircle, Upload, Truck, CheckSquare, AlertCircle, UserPlus,
  PauseCircle, Ban, Search, Loader2, Clock, Activity,
  Shield, Zap, ChevronDown, ExternalLink, RefreshCw,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => s?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase());
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";
const fmtCurrency = (a) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(a || 0);

const STATUS_ORDER = ["pending","assigned_to_designer","design_in_progress","design_completed","approved_for_printing","printing_queued","printing","polishing","ready_for_pickup","out_for_delivery","completed"];

const getSteps = (needsDesign) => needsDesign
  ? [{ key:"pending",label:"Placed" },{ key:"assigned_to_designer",label:"Assigned" },{ key:"design_in_progress",label:"Designing" },{ key:"design_completed",label:"Review" },{ key:"approved_for_printing",label:"Approved" },{ key:"printing",label:"Printing" },{ key:"polishing",label:"Polishing" },{ key:"ready_for_pickup",label:"Ready" },{ key:"out_for_delivery",label:"Delivery" },{ key:"completed",label:"Done" }]
  : [{ key:"pending",label:"Placed" },{ key:"printing_queued",label:"Queued" },{ key:"printing",label:"Printing" },{ key:"polishing",label:"Polishing" },{ key:"ready_for_pickup",label:"Ready" },{ key:"out_for_delivery",label:"Delivery" },{ key:"completed",label:"Done" }];

const TRANSPORT_CHOICES = [
  { value: "pickup",   label: "Client Pickup" },
  { value: "delivery", label: "Company Delivery" },
  { value: "uber",     label: "Uber / Third-party" },
];

const STATUS_COLORS = {
  pending:"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
  assigned_to_designer:"bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/40",
  design_in_progress:"bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/40",
  design_completed:"bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800/40",
  design_rejected:"bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
  approved_for_printing:"bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/40",
  printing_queued:"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40",
  printing:"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40",
  polishing:"bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/40",
  ready_for_pickup:"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
  out_for_delivery:"bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/40",
  completed:"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
  cancelled:"bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700",
};
const TRANSPORT_STATUS_COLORS = {
  pending:"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
  scheduled:"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40",
  in_transit:"bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/40",
  delivered:"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
  failed:"bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>{fmt(status)}</span>
);

const Btn = ({ onClick, disabled, loading, className, children, icon: Icon, type = "button" }) => (
  <button type={type} onClick={onClick} disabled={disabled || loading}
    className={`relative inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-4 py-2.5 transition-all active:scale-[.97] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}>
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm p-6 transition-colors duration-300 ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, iconClass = "text-[#c2410c]", children, aside }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
      {Icon && <Icon className={`w-4 h-4 ${iconClass}`} />}{children}
    </h2>
    {aside}
  </div>
);

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: "fadeIn .2s ease" }}>
    <div className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl ${wide ? "max-w-lg" : "max-w-md"} w-full p-6 border border-stone-200 dark:border-stone-800`} style={{ animation: "modalPop .3s cubic-bezier(.16,1,.3,1)" }}>
      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{label}</label>}
    <input {...props} className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 transition-all placeholder-stone-400" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{label}</label>}
    <textarea {...props} className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 transition-all resize-none placeholder-stone-400" />
  </div>
);

// Searchable user picker
const UserSelect = ({ users, value, onChange, placeholder, label }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const selected = users?.find(u => u.id === parseInt(value));
  const filtered = users?.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.first_name + " " + u.last_name + " " + u.email).toLowerCase().includes(q);
  });
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{label}</label>}
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full text-left px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none transition-all flex items-center justify-between">
          {selected
            ? <div className="flex items-center gap-3 min-w-0"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white text-xs font-bold shrink-0">{selected.first_name?.[0]}{selected.last_name?.[0]}</div><div className="min-w-0"><p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{selected.first_name} {selected.last_name}</p><p className="text-xs text-stone-400 truncate">{selected.email}</p></div></div>
            : <span className="text-stone-400 text-sm">{placeholder || "Select user..."}</span>
          }
          <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (<>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl max-h-64 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-stone-100 dark:border-stone-700">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" /><input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#c2410c]/20" /></div>
            </div>
            <div className="overflow-y-auto flex-1">
              {!filtered?.length
                ? <p className="text-sm text-stone-400 p-4 text-center">No users found</p>
                : filtered.map(u => (
                    <button key={u.id} type="button" onClick={() => { onChange(u.id); setOpen(false); setSearch(""); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-colors ${parseInt(value) === u.id ? "bg-[#fff7ed] dark:bg-[#c2410c]/10" : ""}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white text-xs font-bold shrink-0">{u.first_name?.[0]}{u.last_name?.[0]}</div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">{u.first_name} {u.last_name}</p><p className="text-xs text-stone-400 truncate">{u.email}</p></div>
                    </button>
                  ))
              }
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
};

// ─── Design file download helper ──────────────────────────────────────────────
// Tries a real fetch+blob download; falls back to opening in new tab.
const downloadDesignFile = async (url, orderNumber) => {
  if (!url) return;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const ext = url.split("?")[0].split(".").pop().slice(0, 5) || "file";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `design-${orderNumber}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    toast.success("Design file downloaded ✓");
  } catch {
    // Cloudinary / cross-origin fallback
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Design opened in new tab");
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderDetail = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { currentOrder: order, isLoading, actionLoading, successMessage, error } = useSelector(s => s.orders);
  const { user }  = useSelector(s => s.auth);
  const { users } = useSelector(s => s.users);

  const isAdmin    = user?.role === "admin" || user?.role === "platform_admin";
  const isDesigner = user?.role === "designer";
  const isPrinter  = user?.role === "printer";
  const isClient   = user?.role === "client";

  // ── modal state ──
  const [showReject, setShowReject]           = useState(false);
  const [showSubmit, setShowSubmit]           = useState(false);
  const [showDelivery, setShowDelivery]       = useState(false);
  const [showAssignDes, setShowAssignDes]     = useState(false);
  const [showAssignPrt, setShowAssignPrt]     = useState(false);
  const [showPayment, setShowPayment]         = useState(false);
  const [showCancel, setShowCancel]           = useState(false);

  // ── form state ──
  const [transportType, setTransportType]     = useState("delivery");
  const [deliveryAddr, setDeliveryAddr]       = useState("");
  const [deliveryCity, setDeliveryCity]       = useState("");
  const [deliveryPhone, setDeliveryPhone]     = useState("");
  const [deliveryInstr, setDeliveryInstr]     = useState("");
  const [rejectReason, setRejectReason]       = useState("");
  const [designFile, setDesignFile]           = useState(null);
  const [designNotes, setDesignNotes]         = useState("");
  const [designerId, setDesignerId]           = useState("");
  const [printerId, setPrinterId]             = useState("");
  const [phone, setPhone]                     = useState("");
  const [cancelReason, setCancelReason]       = useState("");
  const [loadingKey, setLoadingKey]           = useState("");

  useEffect(() => { dispatch(fetchOrder(id)); }, [dispatch, id]);
  useEffect(() => {
    if ((showAssignDes || showAssignPrt) && isAdmin) dispatch(fetchUsers());
  }, [showAssignDes, showAssignPrt, isAdmin, dispatch]);

  // Show toasts from slice
  useEffect(() => { if (successMessage) { toast.success(successMessage); dispatch(clearSuccess()); dispatch(fetchOrder(id)); } }, [successMessage, dispatch, id]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const designers = users?.filter(u => u.role === "designer" && u.is_active !== false) || [];
  const printers  = users?.filter(u => u.role === "printer"  && u.is_active !== false) || [];

  // Generic action runner — uses thunk.unwrap() for local loading key
  const run = async (thunk, payload, key, onSuccess) => {
    setLoadingKey(key);
    try {
      await dispatch(thunk(payload)).unwrap();
      onSuccess?.();
    } catch (e) {
      toast.error(typeof e === "string" ? e : e?.detail || e?.message || "Something went wrong");
    } finally { setLoadingKey(""); }
  };

  // ─── loading / missing ───
  if (isLoading && !order) return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded-xl w-1/3" />
      <div className="h-28 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
      <div className="h-64 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
      <div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-96 bg-stone-200 dark:bg-stone-700 rounded-2xl" /><div className="h-96 bg-stone-200 dark:bg-stone-700 rounded-2xl" /></div>
    </div>
  );
  if (!order) return <div className="flex items-center justify-center h-64 text-stone-400">Order not found</div>;

  const steps       = getSteps(order.needs_design);
  const isRejected  = order.status === "design_rejected";
  const isCancelled = order.status === "cancelled";
  const isPickup    = order.transportation?.transport_type === "pickup";

  // ─── permissions ───
  const canAssignDesigner    = isAdmin && order.status === "pending" && order.needs_design && !order.assigned_designer;
  const canAssignPrinter     = isAdmin && (order.status === "approved_for_printing" || (!order.needs_design && order.status === "pending")) && !order.assigned_printer;
  const canStartDesign       = isDesigner && ["assigned_to_designer","design_rejected"].includes(order.status) && order.assigned_designer === user?.id;
  const canSubmitDesign      = isDesigner && order.status === "design_in_progress" && order.assigned_designer === user?.id;
  const canApproveReject     = isClient && order.status === "design_completed" && order.user === user?.id;
  const canStartPrinting     = isPrinter && ["approved_for_printing","printing_queued"].includes(order.status);
  const canPolish            = isPrinter && order.status === "printing";
  const canMarkReady         = isPrinter && order.status === "polishing";
  const canSendDelivery      = isAdmin && order.status === "ready_for_pickup";
  const canMarkDelivered     = isAdmin && order.status === "out_for_delivery";
  const canCancel            = (isAdmin || isClient) && !["completed","cancelled"].includes(order.status);
  const needsPayment         = isClient && order.invoice && !order.invoice.is_fully_paid && order.invoice.balance_due > 0;
  const hasDesignFile        = !!order.design_file_url;
  const printerCanDownload   = isPrinter && hasDesignFile;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-300" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Order #{order.order_number}</h1>
              <StatusBadge status={order.status} />
              {order.priority && order.priority !== "normal" && (
                <span className="text-xs px-2.5 py-0.5 bg-[#fff7ed] dark:bg-[#c2410c]/15 text-[#c2410c] dark:text-[#ea580c] rounded-lg border border-[#c2410c]/15 uppercase font-bold">{order.priority}</span>
              )}
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {fmtDate(order.created_at)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5 items-start">
          <button onClick={() => dispatch(fetchOrder(id))} className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-95 shrink-0">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Printer design download — prominent */}
          {printerCanDownload && (
            <button onClick={() => downloadDesignFile(order.design_file_url, order.order_number)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/20 hover:from-sky-700 hover:to-blue-700 active:scale-[.97] transition-all">
              <Download className="w-4 h-4" /> Download Design
            </button>
          )}

          {canAssignDesigner    && <Btn icon={UserPlus} onClick={() => setShowAssignDes(true)} className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">Assign Designer</Btn>}
          {canAssignPrinter     && <Btn icon={UserPlus} onClick={() => setShowAssignPrt(true)} className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm">Assign Printer</Btn>}
          {canStartDesign       && <Btn icon={Play} loading={loadingKey === "startDesign"} onClick={() => run(startDesign, id, "startDesign")} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">Start Design</Btn>}
          {canSubmitDesign      && <Btn icon={Upload} onClick={() => setShowSubmit(true)} className="bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20">Submit Design</Btn>}
          {canApproveReject     && <>
            <Btn icon={CheckCircle} loading={loadingKey === "approve"} onClick={() => run(approveDesign, { id, approved: true }, "approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">Approve Design</Btn>
            <Btn icon={XCircle} onClick={() => setShowReject(true)} className="bg-red-600 hover:bg-red-700 text-white shadow-sm">Reject</Btn>
          </>}
          {canStartPrinting     && <Btn icon={Play} loading={loadingKey === "startPrint"} onClick={() => run(startPrintJob, id, "startPrint")} className="bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20">Start Printing</Btn>}
          {canPolish            && <Btn icon={CheckSquare} loading={loadingKey === "polish"} onClick={() => run(moveToPolishing, id, "polish")} className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">Move to Polishing</Btn>}
          {canMarkReady         && <Btn icon={CheckCircle} loading={loadingKey === "ready"} onClick={() => run(completePrintJob, id, "ready")} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">Mark Ready</Btn>}
          {canSendDelivery && !order.transportation?.id && <Btn icon={Truck} onClick={() => setShowDelivery(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm">Setup Delivery</Btn>}
          {canSendDelivery && order.transportation && order.status !== "out_for_delivery" && <Btn icon={Truck} loading={loadingKey === "sendOut"} onClick={() => run(markOutForDelivery, order.transportation.id, "sendOut")} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Send Out</Btn>}
          {canMarkDelivered && order.transportation && <Btn icon={CheckCircle} loading={loadingKey === "delivered"} onClick={() => run(markDelivered, order.transportation.id, "delivered")} className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm">Mark Delivered</Btn>}
          {needsPayment         && <Btn icon={CreditCard} onClick={() => setShowPayment(true)} className="bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20">Pay Invoice</Btn>}
          {canCancel            && <Btn icon={Ban} onClick={() => setShowCancel(true)} className="border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15">Cancel</Btn>}
        </div>
      </div>

      {/* ── PROGRESS TRACKER ── */}
      <Card>
        <SectionTitle icon={Activity}>Order Progress</SectionTitle>
        {isRejected ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200/70 dark:border-red-800/30 rounded-xl">
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div><p className="font-semibold text-red-700 dark:text-red-300">Design Rejected</p>{order.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{order.rejection_reason}</p>}</div>
          </div>
        ) : isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
            <Ban className="w-6 h-6 text-stone-500 shrink-0" />
            <div><p className="font-semibold text-stone-600 dark:text-stone-300">Order Cancelled</p>{order.cancellation_reason && <p className="text-sm text-stone-500 mt-0.5">{order.cancellation_reason}</p>}</div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="relative min-w-max sm:min-w-0">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200 dark:bg-stone-700" />
              <div className="relative flex gap-1">
                {steps.map((step, i) => {
                  const statusIdx = STATUS_ORDER.indexOf(order.status);
                  const stepIdx   = STATUS_ORDER.indexOf(step.key);
                  const done      = statusIdx > stepIdx;
                  const current   = order.status === step.key;
                  return (
                    <div key={step.key} className="flex flex-col items-center z-10" style={{ flex: 1, minWidth: 60 }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30" : current ? "bg-[#c2410c] border-[#c2410c] text-white ring-4 ring-[#c2410c]/20 shadow-md shadow-[#c2410c]/30" : "bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-400"}`}>
                        {done ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <p className={`mt-2 text-[10px] text-center leading-tight font-medium max-w-[56px] ${current ? "text-[#c2410c] dark:text-[#ea580c] font-bold" : done ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400 dark:text-stone-600"}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {(order.assigned_designer || order.assigned_printer) && (
          <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-3">
            {order.assigned_designer && <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-900/15 rounded-xl border border-purple-200/50 dark:border-purple-800/30"><User className="w-4 h-4 text-purple-500" /><span className="text-sm font-medium text-purple-700 dark:text-purple-300">Designer: {order.designer_name || `#${order.assigned_designer}`}</span></div>}
            {order.assigned_printer && <div className="flex items-center gap-2 px-3.5 py-2 bg-sky-50 dark:bg-sky-900/15 rounded-xl border border-sky-200/50 dark:border-sky-800/30"><User className="w-4 h-4 text-sky-500" /><span className="text-sm font-medium text-sky-700 dark:text-sky-300">Printer: {order.printer_name || `#${order.assigned_printer}`}</span></div>}
          </div>
        )}
      </Card>

      {/* ── PRINTER: Design file banner ── */}
      {printerCanDownload && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/15 dark:to-blue-900/15 border border-sky-200/60 dark:border-sky-800/30 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center shrink-0"><FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" /></div>
              <div>
                <p className="font-bold text-sky-900 dark:text-sky-200">Approved Design File Ready</p>
                <p className="text-sm text-sky-600 dark:text-sky-400">Download this file before starting your print job</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={order.design_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 rounded-xl text-sm font-bold hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-all active:scale-95">
                <ExternalLink className="w-4 h-4" /> Open
              </a>
              <button onClick={() => downloadDesignFile(order.design_file_url, order.order_number)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/20 transition-all active:scale-95">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ORDER ITEMS */}
          <Card>
            <SectionTitle icon={Package} aside={<span className="text-sm text-stone-400">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</span>}>Order Items</SectionTitle>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                  <div className="w-14 h-14 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center shrink-0"><Package className="h-7 w-7 text-stone-400 dark:text-stone-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">{item.product_name || "Product"}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">Qty: <span className="font-bold text-stone-700 dark:text-stone-300">{item.quantity}</span> @ {fmtCurrency(item.unit_price)}</p>
                    {item.specifications && Object.keys(item.specifications).length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">{Object.entries(item.specifications).map(([k, v]) => <span key={k} className="text-xs bg-[#fff7ed] dark:bg-[#c2410c]/10 px-2.5 py-1 rounded-lg border border-[#c2410c]/15 text-[#c2410c] dark:text-[#ea580c] font-semibold">{k}: {v}</span>)}</div>
                    )}
                    {item.field_values?.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {item.field_values.map((fv, j) => (
                          <span key={fv.id || j} className="text-xs bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 font-medium flex items-center gap-1">
                            {fv.field?.name}: {fv.value}
                            {fv.file_url && <a href={fv.file_url} target="_blank" rel="noreferrer" className="text-[#c2410c] ml-1"><Download className="w-3 h-3 inline" /></a>}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && <p className="mt-2 text-sm text-stone-500 italic">Note: {item.notes}</p>}
                  </div>
                  <p className="font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0">{fmtCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 space-y-2.5 text-sm">
              {[
                ["Subtotal",  order.subtotal,       "text-stone-700 dark:text-stone-300", false],
                ...(order.tax > 0          ? [["Tax",       order.tax,       "text-stone-700 dark:text-stone-300", false]] : []),
                ...(order.delivery_fee > 0 ? [["Delivery",  order.delivery_fee,"text-stone-700 dark:text-stone-300", false]] : []),
                ...(order.discount > 0     ? [["Discount",  order.discount,  "text-emerald-600 dark:text-emerald-400", true]] : []),
              ].map(([label, amount, cls, neg]) => (
                <div key={label} className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>{label}</span><span className={`font-medium ${cls}`}>{neg ? "-" : ""}{fmtCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-3 border-t border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                <span>Total</span><span>{fmtCurrency(order.total_price)}</span>
              </div>
            </div>
          </Card>

          {/* DESIGN WORKFLOW */}
          {order.needs_design && (
            <Card>
              <SectionTitle icon={FileText} iconClass="text-purple-500">Design Workflow</SectionTitle>
              {/* Client brief */}
              <div className="mb-5 p-4 bg-sky-50 dark:bg-sky-900/10 border border-sky-200/50 dark:border-sky-800/30 rounded-xl">
                <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">Client Brief</p>
                {order.design_description ? <p className="text-sm text-sky-700 dark:text-sky-300">{order.design_description}</p> : <p className="text-sm text-stone-400 italic">No description provided</p>}
                {order.client_files?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {order.client_files.map((f, i) => <a key={i} href={f.url || f} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium"><Download className="w-3.5 h-3.5" /> {f.name || `File ${i + 1}`}</a>)}
                  </div>
                )}
              </div>
              {/* Submitted design */}
              {hasDesignFile ? (
                <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Designer Submission</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0"><FileText className="h-6 w-6 text-emerald-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Design file uploaded</p>
                      <p className="text-xs text-stone-400 mt-0.5">{fmtDate(order.design_completed_at)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a href={order.design_file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#c2410c] hover:bg-[#b03a0b] text-white rounded-lg text-sm font-semibold transition-colors">View</a>
                      {(isPrinter || isAdmin || isDesigner) && (
                        <button onClick={() => downloadDesignFile(order.design_file_url, order.order_number)} className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download</button>
                      )}
                    </div>
                  </div>
                  {order.design_notes && <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-700 italic">"{order.design_notes}"</p>}
                </div>
              ) : (
                <div className="mb-5 p-6 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl text-center border border-dashed border-stone-200 dark:border-stone-700">
                  <PauseCircle className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                  <p className="text-sm text-stone-400 font-medium">No design submitted yet</p>
                </div>
              )}
              {order.design_revisions > 0 && <p className="text-xs font-semibold text-[#c2410c] dark:text-[#ea580c] flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Revisions: {order.design_revisions} / {order.max_revisions}</p>}
            </Card>
          )}

          {/* INVOICE */}
          {order.invoice && (
            <Card>
              <SectionTitle icon={CreditCard} iconClass="text-emerald-500">Invoice</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Invoice #",   value: order.invoice.invoice_number, cls: "" },
                  { label: "Total",       value: fmtCurrency(order.invoice.total_amount), cls: "" },
                  { label: "Deposit 70%", value: fmtCurrency(order.invoice.deposit_amount), sub: `Paid: ${fmtCurrency(order.invoice.deposit_paid || 0)}`, cls: "bg-[#fff7ed] dark:bg-[#c2410c]/10 border-[#c2410c]/15 dark:border-[#c2410c]/20" },
                  { label: "Balance Due", value: fmtCurrency(order.invoice.balance_due), cls: "bg-sky-50 dark:bg-sky-900/10 border-sky-200/50 dark:border-sky-800/30" },
                ].map(({ label, value, sub, cls }) => (
                  <div key={label} className={`p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 ${cls}`}>
                    <p className="text-xs text-stone-400 font-medium mb-1">{label}</p>
                    <p className="font-bold text-stone-800 dark:text-stone-200">{value}</p>
                    {sub && <p className="text-xs mt-0.5 text-stone-500">{sub}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                <StatusBadge status={order.invoice.status} />
                {!order.invoice.is_deposit_paid
                  ? <p className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Deposit not paid — work cannot start</p>
                  : order.invoice.balance_due > 0
                  ? <p className="text-xs text-amber-600 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Balance outstanding: {fmtCurrency(order.invoice.balance_due)}</p>
                  : <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Fully paid</p>
                }
              </div>
            </Card>
          )}

          {/* ACTIVITY LOG */}
          {order.status_history?.length > 0 && (
            <Card>
              <SectionTitle icon={Shield} iconClass="text-stone-400">Activity Log</SectionTitle>
              <div className="space-y-0">
                {order.status_history.map((h, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 shrink-0 mt-0.5 ${i === 0 ? "bg-[#c2410c] border-[#c2410c]" : "bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"}`} />
                      {i < order.status_history.length - 1 && <div className="w-0.5 flex-1 min-h-[2rem] bg-stone-200 dark:bg-stone-700 mt-1" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-semibold text-stone-800 dark:text-stone-200">{fmt(h.new_status)}{h.changed_by_name && <span className="text-sm text-stone-400 font-normal"> by {h.changed_by_name}</span>}</p>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDate(h.created_at)}</p>
                      {h.note && <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-800">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-6">
          {/* Client info */}
          <Card>
            <SectionTitle icon={User}>Client</SectionTitle>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-600/20 shrink-0">{order.user_name?.[0] || "?"}</div>
              <p className="font-bold text-stone-800 dark:text-stone-200">{order.user_name || "Unknown"}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-stone-500 dark:text-stone-400"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{order.user_email || "N/A"}</span></div>
              <div className="flex items-center gap-2.5 text-stone-500 dark:text-stone-400"><Phone className="h-4 w-4 shrink-0" /><span>{order.user_phone || "N/A"}</span></div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <SectionTitle icon={Clock}>Timeline</SectionTitle>
            <div className="space-y-3.5 text-sm">
              {[
                ["Created",        order.created_at],
                ["Design Started", order.design_started_at],
                ["Design Done",    order.design_completed_at],
                ["Printing",       order.printing_started_at],
                ["Completed",      order.completed_at],
              ].filter(([, d]) => d).map(([label, date]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-stone-500 shrink-0">{label}</span>
                  <span className={`text-right font-medium ${label === "Completed" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-700 dark:text-stone-300"}`}>{fmtDate(date)}</span>
                </div>
              ))}
              {order.estimated_completion && (
                <div className="flex justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500">Est. Completion</span>
                  <span className="text-[#c2410c] dark:text-[#ea580c] font-bold">{fmtDate(order.estimated_completion)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery */}
          {order.transportation && (
            <Card>
              <SectionTitle icon={Truck}>Delivery</SectionTitle>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center"><span className="text-stone-500">Type</span><span className="capitalize font-medium text-stone-700 dark:text-stone-300">{TRANSPORT_CHOICES.find(c => c.value === order.transportation.transport_type)?.label || fmt(order.transportation.transport_type)}</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-500">Status</span><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${TRANSPORT_STATUS_COLORS[order.transportation.status] || ""}`}>{fmt(order.transportation.status)}</span></div>
                {order.transportation.delivery_address && <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" /><span className="text-stone-600 dark:text-stone-400">{order.transportation.delivery_address}{order.transportation.delivery_city ? `, ${order.transportation.delivery_city}` : ""}</span></div>}
                {isPickup && order.transportation.pickup_location && <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" /><span className="text-stone-600 dark:text-stone-400">{order.transportation.pickup_location}</span></div>}
                {order.transportation.driver_name && <div className="flex justify-between"><span className="text-stone-500">Driver</span><span className="font-medium text-stone-700 dark:text-stone-300">{order.transportation.driver_name}</span></div>}
                {order.transportation.driver_phone && <div className="flex justify-between"><span className="text-stone-500">Driver Phone</span><span className="font-medium text-stone-700 dark:text-stone-300">{order.transportation.driver_phone}</span></div>}
                {order.transportation.tracking_number && <div className="flex justify-between"><span className="text-stone-500">Tracking</span><span className="text-[#c2410c] font-bold">{order.transportation.tracking_number}</span></div>}
                {order.transportation.delivery_fee > 0 && <div className="flex justify-between pt-3 border-t border-stone-100 dark:border-stone-800"><span className="text-stone-500">Delivery Fee</span><span className="font-bold text-stone-900 dark:text-stone-100">{fmtCurrency(order.transportation.delivery_fee)}</span></div>}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ════════════════ MODALS ════════════════ */}

      {showAssignDes && (
        <Modal title="Assign Designer" onClose={() => setShowAssignDes(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Select a designer from your team.</p>
          {!designers.length
            ? <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/70 rounded-xl text-sm text-amber-700 dark:text-amber-300">No active designers found. <button onClick={() => { setShowAssignDes(false); navigate("/app/users"); }} className="underline font-bold ml-1">Invite one →</button></div>
            : <UserSelect users={designers} value={designerId} onChange={setDesignerId} placeholder="Select a designer..." label="Designer" />
          }
          <div className="flex gap-3 mt-6">
            <Btn onClick={() => setShowAssignDes(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</Btn>
            <Btn loading={loadingKey === "assignDes"} disabled={!designerId}
              onClick={() => { if (!designerId) return toast.error("Select a designer"); run(assignDesigner, { id, designer_id: parseInt(designerId) }, "assignDes", () => { setShowAssignDes(false); setDesignerId(""); }); }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-sm">Assign</Btn>
          </div>
        </Modal>
      )}

      {showAssignPrt && (
        <Modal title="Assign Printer" onClose={() => setShowAssignPrt(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Select a printer to handle this order.</p>
          {!printers.length
            ? <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/70 rounded-xl text-sm text-amber-700 dark:text-amber-300">No active printers found. <button onClick={() => { setShowAssignPrt(false); navigate("/app/users"); }} className="underline font-bold ml-1">Invite one →</button></div>
            : <UserSelect users={printers} value={printerId} onChange={setPrinterId} placeholder="Select a printer..." label="Printer" />
          }
          <div className="flex gap-3 mt-6">
            <Btn onClick={() => setShowAssignPrt(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</Btn>
            <Btn loading={loadingKey === "assignPrt"} disabled={!printerId}
              onClick={() => { if (!printerId) return toast.error("Select a printer"); run(assignPrinter, { id, printer_id: parseInt(printerId) }, "assignPrt", () => { setShowAssignPrt(false); setPrinterId(""); }); }}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white shadow-sm">Assign</Btn>
          </div>
        </Modal>
      )}

      {showReject && (
        <Modal title="Reject Design" onClose={() => setShowReject(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Tell the designer what needs to change. This will notify them directly.</p>
          <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="What needs to change?" rows={4} />
          <div className="flex gap-3 mt-5">
            <Btn onClick={() => setShowReject(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</Btn>
            <Btn loading={loadingKey === "reject"}
              onClick={() => { if (!rejectReason.trim()) return toast.error("Provide a reason"); run(rejectDesign, { id, reason: rejectReason }, "reject", () => { setShowReject(false); setRejectReason(""); }); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white">Send Rejection</Btn>
          </div>
        </Modal>
      )}

      {showSubmit && (
        <Modal title="Submit Design" onClose={() => setShowSubmit(false)} wide>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Design File *</label>
              <div className="relative border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl p-6 text-center hover:border-[#c2410c]/50 transition-colors cursor-pointer bg-stone-50/50 dark:bg-stone-800/30">
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                {designFile
                  ? <p className="text-sm font-semibold text-emerald-600">✓ {designFile.name}</p>
                  : <><p className="text-sm font-semibold text-stone-600 dark:text-stone-400">Click to upload</p><p className="text-xs text-stone-400 mt-1">PDF, PNG, JPG, AI, PSD, SVG accepted</p></>
                }
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai,.psd,.svg,.eps" onChange={e => setDesignFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <Textarea label="Notes for client (optional)" value={designNotes} onChange={e => setDesignNotes(e.target.value)} rows={3} placeholder="Describe your design choices, colour codes used, fonts, etc." />
          </div>
          <div className="flex gap-3 mt-6">
            <Btn onClick={() => setShowSubmit(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</Btn>
            <Btn loading={loadingKey === "submitDesign"}
              onClick={() => {
                if (!designFile) return toast.error("Upload a design file first");
                const fd = new FormData(); fd.append("design_file", designFile); if (designNotes) fd.append("design_notes", designNotes);
                run(submitDesign, { orderId: id, data: fd }, "submitDesign", () => { setShowSubmit(false); setDesignFile(null); setDesignNotes(""); });
              }}
              className="flex-1 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20">Submit Design</Btn>
          </div>
        </Modal>
      )}

      {showCancel && (
        <Modal title="Cancel Order" onClose={() => setShowCancel(false)}>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">This action <strong className="text-red-500">cannot be undone</strong>. Provide a reason.</p>
          <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3} />
          <div className="flex gap-3 mt-5">
            <Btn onClick={() => setShowCancel(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Keep Order</Btn>
            <Btn loading={loadingKey === "cancel"} onClick={() => run(cancelOrder, { orderId: id, reason: cancelReason }, "cancel", () => { setShowCancel(false); setCancelReason(""); })}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white">Cancel Order</Btn>
          </div>
        </Modal>
      )}

      {showDelivery && (
        <Modal title="Setup Delivery" onClose={() => setShowDelivery(false)} wide>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Transport Type *</label>
              <select value={transportType} onChange={e => setTransportType(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 transition-all">
                {TRANSPORT_CHOICES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            {transportType === "pickup"
              ? <Textarea label="Pickup Location / Instructions" value={deliveryInstr} onChange={e => setDeliveryInstr(e.target.value)} placeholder="e.g. Our shop at Westlands, ground floor" rows={2} />
              : <>
                  <Textarea label="Delivery Address *" value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)} placeholder="e.g. 123 Westlands Rd, Nairobi" rows={2} />
                  <Input label="City" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} placeholder="e.g. Nairobi" />
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Recipient Phone</label>
                    <div className="flex">
                      <span className="px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-r-0 border-stone-200 dark:border-stone-700 rounded-l-xl text-sm font-bold text-stone-600 dark:text-stone-400">+254</span>
                      <input type="tel" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value.replace(/\D/g,"").slice(0,9))} placeholder="712345678" className="flex-1 px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-r-xl text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 transition-all" />
                    </div>
                  </div>
                  <Textarea label="Delivery Instructions" value={deliveryInstr} onChange={e => setDeliveryInstr(e.target.value)} placeholder="Call on arrival, gate code, building name, etc." rows={2} />
                </>
            }
          </div>
          <div className="flex gap-3 mt-6">
            <Btn onClick={() => setShowDelivery(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</Btn>
            <Btn icon={Truck} loading={loadingKey === "createDelivery"}
              onClick={() => {
                if (transportType !== "pickup" && !deliveryAddr.trim()) return toast.error("Delivery address is required");
                const payload = {
                  order_id: order.id,
                  transport_type: transportType,
                  ...(transportType !== "pickup" && {
                    delivery_address: deliveryAddr.trim(),
                    ...(deliveryCity.trim()  && { delivery_city: deliveryCity.trim() }),
                    ...(deliveryPhone.trim() && { delivery_phone: `254${deliveryPhone}` }),
                    ...(deliveryInstr.trim() && { delivery_instructions: deliveryInstr.trim() }),
                  }),
                  ...(transportType === "pickup" && deliveryInstr.trim() && { pickup_location: deliveryInstr.trim() }),
                };
                run(createTransportation, payload, "createDelivery", () => { setShowDelivery(false); setDeliveryAddr(""); setDeliveryCity(""); setDeliveryPhone(""); setDeliveryInstr(""); });
              }}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm font-semibold">Create Delivery</Btn>
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
              {!order.invoice.is_deposit_paid && <p className="text-xs text-[#c2410c] mt-3 bg-[#fff7ed] dark:bg-[#c2410c]/10 p-2.5 rounded-lg border border-[#c2410c]/15 font-semibold">⚠ Paying 70% deposit to start work</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">M-Pesa Phone Number</label>
              <div className="flex">
                <span className="px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-r-0 border-stone-200 dark:border-stone-700 rounded-l-xl text-sm font-bold text-stone-600 dark:text-stone-400">+254</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,9))} placeholder="712345678" className="flex-1 px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-r-xl outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 text-stone-800 dark:text-stone-100 transition-all" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Btn onClick={() => setShowPayment(false)} className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">Cancel</Btn>
            <Btn icon={Zap} loading={loadingKey === "payment"}
              onClick={() => {
                if (phone.length < 9) return toast.error("Enter a valid Kenyan phone number");
                run(initiateMpesaPayment, { invoice_id: order.invoice.id, phone_number: `254${phone}` }, "payment", () => { setShowPayment(false); setPhone(""); });
              }}
              className="flex-1 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20">Pay Now</Btn>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes modalPop{ from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default OrderDetail;