/**
 * PaymentsPage.jsx
 *
 * Role-aware payments dashboard for PrintFlow.
 *
 * Admin capabilities:
 *   - View all company payments with client info
 *   - Record manual cash/card payments
 *   - Initiate M-Pesa STK push on behalf of client (enters client phone)
 *   - Search by payment number or invoice number
 *
 * Client capabilities:
 *   - View their own payments
 *   - Initiate M-Pesa payment for their invoices via STK push
 *
 * Real-time:
 *   - WebSocket subscription to company payment group
 *   - Falls back to polling every 5 s (max 12 attempts = 60 s)
 *
 * Fixes applied vs previous version:
 *   - Single toast per event (was sending two on WS message)
 *   - Admin M-Pesa flow now correctly shows phone input for client phone
 *   - Manual payment path now refreshes invoice list (backend returns invoice)
 *   - Invoice status badge reflects "partially_paid" as well as "partial"
 *   - Polling correctly reads invoice status from unwrapped payload
 *   - WebSocket reconnect no longer leaks multiple parallel loops
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayments,
  recordPayment,
  fetchPaymentStats,
  initiateMpesaPayment,
  fetchInvoices,
  applyInvoiceUpdate,
} from "@/store/slices/paymentsSlice";
import { fetchOrders } from "@/store/slices/ordersSlice";
import toast from "react-hot-toast";
import { CreditCard, Smartphone, TrendingUp, Clock, Search, FileText, Receipt, User, X, Loader2,Inbox,DollarSign,Banknote,} from "lucide-react";
import { useSearchParams } from "react-router-dom";

// ─── Constants 

const POLL_INTERVAL_MS = 5_000;
const POLL_MAX_ATTEMPTS = 12;
const WS_RECONNECT_DELAY_MS = 3_000;

// ─── Helpers 

// Normalise a Kenyan phone number to 2547XXXXXXXXX format
function normalisePhone(raw) {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "254" + phone.slice(1);
  if (phone.startsWith("7") && phone.length === 9) phone = "254" + phone;
  return phone;
}

//True when the phone is in the required 2547XXXXXXXXX (12-digit) format
function isValidPhone(phone) {
  return phone.startsWith("254") && phone.length === 12;
}

//Format a date for the Kenyan locale
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

//Map an invoice/payment status string to badge classes. 
const STATUS_CFG = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  pending: "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
  partial: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  partially_paid: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  failed: "bg-red-100 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
};

const TYPE_CFG = {
  deposit: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  balance: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  full: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
};

const INITIAL_FORM = {
  invoice_id: "",
  amount: "",
  payment_type: "deposit",
  payment_method: "mpesa",
  phone_number: "",
  transaction_id: "",
  notes: "",
};

// ─── Sub-components

const Badge = ({ children, config }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}
  >
    {children}
  </span>
);

const StatCard = ({ icon: Icon, value, label, gradient, shadow }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 transition-colors duration-300">
    <div
      className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center shrink-0 shadow-lg ${shadow}`}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate tabular-nums">
        {value}
      </p>
    </div>
  </div>
);

const EmptyState = ({ text, sub }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
      <Inbox className="w-6 h-6 text-stone-300 dark:text-stone-600" />
    </div>
    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{text}</p>
    {sub && (
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{sub}</p>
    )}
  </div>
);

// ─── Main Component

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, stats, loading, invoices } = useSelector((s) => s.payments);
  const { user } = useSelector((s) => s.auth);
  const { orders } = useSelector((s) => s.orders);
  const [searchParams] = useSearchParams();

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  // Refs for cleanup
  const wsRef = useRef(null);
  const wsReconnectRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // ── Initial data load 
  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchPaymentStats());
    dispatch(fetchInvoices());
    if (isAdmin) dispatch(fetchOrders());
  }, [dispatch, isAdmin]);

  // ── Pre-fill invoice from URL param
  useEffect(() => {
    const invoiceFromUrl = searchParams.get("invoice");
    if (invoiceFromUrl) {
      setForm((prev) => ({ ...prev, invoice_id: invoiceFromUrl }));
      setShowModal(true);
    }
  }, [searchParams]);

  // ── Helpers 
  const getInvoice = useCallback(
    (invId) => invoices?.find((i) => i.id === Number(invId)) ?? null,
    [invoices]
  );

  const resetForm = () => setForm(INITIAL_FORM);

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    // Stop any active poll when modal is closed
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      setPollingActive(false);
    }
  };

  // ── Filtered payment list 
  const filtered = payments?.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.payment_number?.toLowerCase().includes(term) ||
      (p.invoice_number || "").toLowerCase().includes(term)
    );
  });

  // ── WebSocket setup
  useEffect(() => {
    let socket = null;

    const connect = () => {
      const token = localStorage.getItem("access_token");
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${proto}://localhost:8000/ws/notifications/?token=${token}`;

      socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        // Clear pending reconnect if any
        if (wsReconnectRef.current) {
          clearTimeout(wsReconnectRef.current);
          wsReconnectRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "payment_update") {
            // Apply optimistic update to invoice list
            dispatch(applyInvoiceUpdate(data));
            // Refresh full lists for accuracy
            dispatch(fetchPayments());
            dispatch(fetchPaymentStats());
            dispatch(fetchInvoices());

            // Single, meaningful toast
            const statusLabel =
              data.status === "paid" || data.status === "Paid"
                ? "fully paid "
                : "deposit received ";
            toast.success(`Invoice ${statusLabel}`, { id: "payment-update" });
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      socket.onclose = () => {
        // Only reconnect if we haven't already queued one
        if (!wsReconnectRef.current) {
          wsReconnectRef.current = setTimeout(() => {
            wsReconnectRef.current = null;
            connect();
          }, WS_RECONNECT_DELAY_MS);
        }
      };

      socket.onerror = () => {
        socket.close(); // triggers onclose 
      };
    };

    connect();

    return () => {
      // Disable reconnect before closing so cleanup is clean
      if (wsReconnectRef.current) {
        clearTimeout(wsReconnectRef.current);
        wsReconnectRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [dispatch]);

  // ── Polling helper (fallback when WS misses callback) 
  const startPolling = (invoiceId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setPollingActive(true);

    let attempts = 0;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;

      const result = await dispatch(fetchInvoices());
      const invoiceList = result.payload?.results ?? result.payload ?? [];
      const updated = invoiceList.find((i) => i.id === invoiceId);

      const isDone =
        updated &&
        (updated.status === "paid" ||
          updated.status === "Paid" ||
          updated.status === "partial" ||
          updated.status === "partially_paid");

      if (isDone) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setPollingActive(false);

        const label =
          updated.status === "paid" || updated.status === "Paid"
            ? "Payment complete — invoice fully paid!"
            : "Deposit received — invoice partially paid.";

        toast.success(label, { id: "poll-success" });
        dispatch(fetchPayments());
        dispatch(fetchPaymentStats());
        closeModal();
        return;
      }

      if (attempts >= POLL_MAX_ATTEMPTS) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setPollingActive(false);
        toast("payment timeout or user cancelled or entered the wrong pin.", {
          icon: "⏳",
          id: "poll-timeout",
        });
      }
    }, POLL_INTERVAL_MS);
  };

  //  Form submit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice_id) return toast.error("Please select an invoice.");
    setSubmitting(true);

    try {
      // ── M-Pesa STK Push 
      if (form.payment_method === "mpesa") {
        const phone = normalisePhone(form.phone_number);
        if (!isValidPhone(phone)) {
          return toast.error("Phone must be format: 2547XXXXXXXXX");
        }

        const invoiceId = parseInt(form.invoice_id, 10);
        const result = await dispatch(
          initiateMpesaPayment({ invoice_id: invoiceId, phone_number: phone })
        );

        if (!initiateMpesaPayment.fulfilled.match(result)) {
          const errMsg =
            typeof result.payload === "string"
              ? result.payload
              : result.payload?.error || "Failed to initiate M-Pesa payment.";
          return toast.error(errMsg);
        }

        toast.success("STK push sent — check your phone.", { id: "stk-sent" });
        // Start polling as fallback in case WS notification is missed
        startPolling(invoiceId);
        return;
      }

      // ── Manual payment (cash / card) 
      if (!form.amount || isNaN(parseFloat(form.amount))) {
        return toast.error("Please enter a valid amount.");
      }

      const result = await dispatch(
        recordPayment({
          invoice_id: parseInt(form.invoice_id, 10),
          amount: parseFloat(form.amount),
          payment_type: form.payment_type,
          payment_method: form.payment_method,
          transaction_id: form.transaction_id,
          notes: form.notes,
        })
      );

      if (recordPayment.fulfilled.match(result)) {
        toast.success("Payment recorded successfully.");
        dispatch(fetchPayments());
        dispatch(fetchPaymentStats());
        dispatch(fetchInvoices());
        closeModal();
      } else {
        const errMsg =
          typeof result.payload === "string"
            ? result.payload
            : result.payload?.error ||
              Object.values(result.payload || {})?.[0]?.[0] ||
              "Failed to record payment.";
        toast.error(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived state 
  const selectedInvoice = getInvoice(form.invoice_id);

  // CSS helpers
  const inputCls =
    "w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all";
  const labelCls =
    "block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5";

  // ── Mobile payment card 
  const PaymentCard = ({ p }) => {
    const inv = getInvoice(p.invoice);
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
              {p.payment_number}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              {fmtDate(p.created_at)}
            </p>
          </div>
          <Badge config={STATUS_CFG[p.status] ?? STATUS_CFG.pending}>
            {p.status_display || p.status}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
          KES {(p.amount || 0).toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-400 dark:text-stone-500">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" />
            {p.invoice_number || `INV-${p.invoice}`}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {inv?.order_number || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            {p.payment_method === "mpesa" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
            {p.payment_method_display || p.payment_method}
          </span>
        </div>
        <Badge config={TYPE_CFG[p.payment_type] ?? TYPE_CFG.deposit}>
          {p.payment_type_display || p.payment_type}
        </Badge>
      </div>
    );
  };

  // ── Render
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header  */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#c2410c]" />
            </div>
            Payments
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">
            Track all payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98] transition-all"
        >
          <CreditCard className="w-4 h-4" />
          {isAdmin ? "Record Payment" : "Make Payment"}
        </button>
      </div>

      {/* ── Stats  */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          value={`KES ${Number(stats?.total_revenue || 0).toLocaleString()}`}
          label="Total Revenue"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
        />
        <StatCard
          icon={DollarSign}
          value={stats?.total_payments ?? payments?.length ?? 0}
          label="Total Payments"
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          shadow="shadow-blue-500/20"
        />
        <StatCard
          icon={Clock}
          value={stats?.pending ?? 0}
          label="Pending Invoices"
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          shadow="shadow-amber-500/20"
        />
      </div>

      {/* ── Payments Table*/}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Transactions
              </h2>
              {filtered?.length > 0 && (
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">
                  {filtered.length} result{filtered.length !== 1 && "s"}
                </span>
              )}
            </div>
            {isAdmin && (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search payment or invoice…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered?.length === 0 ? (
            <EmptyState
              text={search ? "No payments match your search" : "No payments yet"}
              sub={search ? "Try a different term" : "Payments will appear once recorded"}
            />
          ) : (
            filtered.map((p) => <PaymentCard key={p.id} p={p} />)
          )}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                {[
                  "Payment #",
                  "Invoice",
                  "Order",
                  isAdmin ? "Client" : null,
                  "Amount",
                  "Type",
                  "Method",
                  "Status",
                  "Date",
                ]
                  .filter(Boolean)
                  .map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-stone-400 dark:text-stone-500">
                      Loading payments…
                    </p>
                  </td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState
                      text={search ? "No payments match your search" : "No payments yet"}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const inv = getInvoice(p.invoice);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-sm font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        {p.payment_number}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {p.invoice_number || `INV-${p.invoice}`}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {inv?.order_number || "—"}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                            {inv?.client_name || "—"}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-3.5 text-sm font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap tabular-nums">
                        KES {(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge config={TYPE_CFG[p.payment_type] ?? TYPE_CFG.deposit}>
                          {p.payment_type_display || p.payment_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                          {p.payment_method === "mpesa" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                          {p.payment_method_display || p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge config={STATUS_CFG[p.status] ?? STATUS_CFG.pending}>
                          {p.status_display || p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-stone-400 dark:text-stone-500 whitespace-nowrap tabular-nums">
                        {fmtDate(p.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payment Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1c1917]/50 dark:bg-black/60 backdrop-blur-md"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl shadow-stone-900/10 dark:shadow-black/40 border border-stone-200/60 dark:border-stone-700 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center shadow-sm">
                  {form.payment_method === "mpesa" ? (
                    <Smartphone className="w-5 h-5 text-[#c2410c]" />
                  ) : form.payment_method === "cash" ? (
                    <Banknote className="w-5 h-5 text-[#c2410c]" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-[#c2410c]" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {isAdmin ? "Record Payment" : "Make Payment"}
                  </h3>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {pollingActive
                      ? "Waiting for M-Pesa confirmation…"
                      : "Select an invoice to proceed"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-100 dark:border-stone-700 flex items-center justify-center transition-colors active:scale-95"
              >
                <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              </button>
            </div>

            {/* Polling banner */}
            {pollingActive && (
              <div className="mx-6 mt-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Checking payment status every 5 seconds…
                </p>
              </div>
            )}

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0 overflow-y-auto"
            >
              <div className="p-6 space-y-5 flex-1">
                {/* Invoice select */}
                <div>
                  <label className={labelCls}>
                    Invoice <span className="text-[#c2410c]">*</span>
                  </label>
                  <select
                    value={form.invoice_id}
                    onChange={(e) => {
                      const inv = getInvoice(parseInt(e.target.value, 10));
                      setForm({
                        ...form,
                        invoice_id: e.target.value,
                        amount: inv?.balance_due?.toString() ?? "",
                      });
                    }}
                    className={inputCls + " appearance-none cursor-pointer"}
                    disabled={pollingActive}
                  >
                    <option value="">Select invoice</option>
                    {invoices
                      ?.filter((i) => i.status !== "cancelled" && i.status !== "paid")
                      .map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_number} — Balance: KES{" "}
                          {(inv.balance_due || 0).toLocaleString()} (
                          {inv.status})
                        </option>
                      ))}
                  </select>

                  {/* Invoice summary strip */}
                  {selectedInvoice && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Total",
                          value: selectedInvoice.total_amount,
                          color: "text-stone-700 dark:text-stone-300",
                        },
                        {
                          label: "Paid",
                          value: selectedInvoice.amount_paid,
                          color: "text-emerald-600 dark:text-emerald-400",
                        },
                        {
                          label: "Balance",
                          value: selectedInvoice.balance_due,
                          color: "text-[#c2410c]",
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-center"
                        >
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">
                            {label}
                          </p>
                          <p className={`text-sm font-bold tabular-nums mt-0.5 ${color}`}>
                            {(value || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment method picker */}
                <div>
                  <label className={labelCls}>
                    Payment Method <span className="text-[#c2410c]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        val: "mpesa",
                        icon: Smartphone,
                        label: "M-Pesa",
                        desc: "Mobile money",
                      },
                      ...(isAdmin
                        ? [
                            {
                              val: "cash",
                              icon: Banknote,
                              label: "Cash",
                              desc: "Manual entry",
                            },
                            {
                              val: "card",
                              icon: CreditCard,
                              label: "Card",
                              desc: "Manual entry",
                            },
                          ]
                        : []),
                    ].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        disabled={pollingActive}
                        onClick={() => setForm({ ...form, payment_method: m.val })}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98] disabled:opacity-50 ${
                          form.payment_method === m.val
                            ? "border-[#c2410c]/30 bg-[#fff7ed] dark:bg-[#c2410c]/10 dark:border-[#c2410c]/20"
                            : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/80"
                        }`}
                      >
                        <m.icon
                          className={`w-5 h-5 shrink-0 ${
                            form.payment_method === m.val
                              ? "text-[#c2410c]"
                              : "text-stone-400 dark:text-stone-500"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              form.payment_method === m.val
                                ? "text-[#c2410c]"
                                : "text-stone-700 dark:text-stone-300"
                            }`}
                          >
                            {m.label}
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500">
                            {m.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional fields based on method */}
                {form.payment_method === "mpesa" ? (
                  /* M-Pesa: always need a phone number (client enters own, admin enters client's) */
                  <div>
                    <label className={labelCls}>
                      {isAdmin ? "Client Phone Number" : "Your Phone Number"}{" "}
                      <span className="text-[#c2410c]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone_number}
                      onChange={(e) =>
                        setForm({ ...form, phone_number: e.target.value })
                      }
                      placeholder="0712 345 678 or 2547XXXXXXXX"
                      inputMode="numeric"
                      autoComplete="tel"
                      disabled={pollingActive}
                      className={inputCls}
                    />
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                      {isAdmin
                        ? "The STK push will be sent to this phone number."
                        : "We will send an M-Pesa prompt to this number."}
                    </p>
                  </div>
                ) : (
                  /* Cash / Card: manual entry fields */
                  <>
                    <div>
                      <label className={labelCls}>
                        Amount (KES) <span className="text-[#c2410c]">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                        inputMode="decimal"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Payment Type</label>
                      <select
                        value={form.payment_type}
                        onChange={(e) =>
                          setForm({ ...form, payment_type: e.target.value })
                        }
                        className={inputCls + " appearance-none cursor-pointer"}
                      >
                        <option value="deposit">Deposit (70%)</option>
                        <option value="balance">Balance (30%)</option>
                        <option value="full">Full Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Transaction / Reference ID
                      </label>
                      <input
                        type="text"
                        value={form.transaction_id}
                        onChange={(e) =>
                          setForm({ ...form, transaction_id: e.target.value })
                        }
                        placeholder="e.g. receipt number or bank ref"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Notes (optional)</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                        rows={2}
                        placeholder="Any additional notes…"
                        className={inputCls + " resize-none"}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 text-sm font-bold hover:bg-stone-100 dark:hover:bg-stone-700 transition-all active:scale-[0.98]"
                >
                  {pollingActive ? "Cancel" : "Close"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.invoice_id || pollingActive}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting || pollingActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : form.payment_method === "mpesa" ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {submitting
                    ? "Sending…"
                    : pollingActive
                    ? "Awaiting payment…"
                    : form.payment_method === "mpesa"
                    ? "Send M-Pesa Prompt"
                    : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;