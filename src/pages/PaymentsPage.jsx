import React, { useEffect, useState,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchPayments,recordPayment,fetchPaymentStats,initiateMpesaPayment,fetchInvoices,} from "@/store/slices/paymentsSlice";
import { fetchOrders } from "@/store/slices/ordersSlice";
import toast from "react-hot-toast";
import {CreditCard,Smartphone,TrendingUp,Clock,Search,FileText,Receipt,User,X,Loader2,Inbox,} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, stats, loading, invoices } = useSelector((s) => s.payments);
  const { user } = useSelector((s) => s.auth);
  const { orders } = useSelector((s) => s.orders);
  const [searchParams] = useSearchParams();
  const wsRef = useRef(null);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    invoice_id: "",
    amount: "",
    payment_type: "deposit",
    payment_method: "mpesa",
    phone_number: "",
  });

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchPaymentStats());
    dispatch(fetchInvoices());
    if (isAdmin) dispatch(fetchOrders());
  }, [dispatch]);

  const filtered = payments?.filter((p) => {
    const term = search.toLowerCase();

    return (
      !search ||
      p.payment_number?.toLowerCase().includes(term) ||
      (p.invoice_number || "").toLowerCase().includes(term)
    );
  });

  const getInvoice = (invId) => {
  if (!invoices) return null;
  return invoices.find((i) => i.id === invId);
};
// Auto-open payment modal if "invoice" query param is present
useEffect(() => {
  const invoiceFromUrl = searchParams.get("invoice");

  if (invoiceFromUrl) {
    setForm((prev) => ({
      ...prev,
      invoice_id: invoiceFromUrl
    }));

    setShowModal(true); // open modal automatically
  }
}, [searchParams]);
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.invoice_id) return toast.error("Select an invoice");

  setSubmitting(true);

  try {
    if (form.payment_method === "mpesa") {
      let phone = form.phone_number.replace(/\D/g, "");

      if (phone.startsWith("0")) phone = "254" + phone.substring(1);

      if (!phone.startsWith("254") || phone.length !== 12) {
        return toast.error("Phone format: 2547XXXXXXXX");
      }

      const invoiceId = parseInt(form.invoice_id);

      const r = await dispatch(
        initiateMpesaPayment({
          invoice_id: invoiceId,
          phone_number: phone,
        })
      );

      if (!initiateMpesaPayment.fulfilled.match(r)) {
        return toast.error(r.payload || "Failed to initiate M-Pesa");
      }

      const checkoutId = r.payload.checkout_request_id;

      toast.success("Check your phone for M-Pesa prompt");

      // ─────────────────────────────
      // POLLING (invoice-based)
      // ─────────────────────────────
      const checkPayment = async () => {
  try {
    const res = await dispatch(fetchInvoices());
    const invoices = res.payload;

    const updated = invoices?.find(i => i.id === invoiceId);

    if (!updated) return false;

    if (updated.status === "paid") {
      toast.success("Payment completed");
      setShowModal(false);
      resetForm();

      dispatch(fetchPayments());
      dispatch(fetchPaymentStats());
      return true;
    }

    if (updated.status === "partial") {
      toast.success("Deposit received");
      setShowModal(false);
      resetForm();

      dispatch(fetchPayments());
      dispatch(fetchPaymentStats());
      return true;
    }

    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// retry loop (clean + controlled)
let attempts = 0;
const maxAttempts = 12;

const interval = setInterval(async () => {
  attempts++;

  const done = await checkPayment();

  if (done || attempts >= maxAttempts) {
    clearInterval(interval);

    if (!done) {
      toast("Still processing payment. Check your phone.", {
        icon: "⏳",
      });
    }
  }
}, 5000);

      return;
    }

    // ─────────────────────────────
    // MANUAL PAYMENTS (cash/card)
    // ─────────────────────────────
    if (!form.amount) {
      return toast.error("Enter amount");
    }

    const r = await dispatch(
      recordPayment({
        invoice_id: parseInt(form.invoice_id),
        amount: parseFloat(form.amount),
        payment_type: form.payment_type,
        payment_method: form.payment_method,
      })
    );

    if (recordPayment.fulfilled.match(r)) {
      toast.success("Payment recorded successfully");

      setShowModal(false);
      resetForm();

      dispatch(fetchPayments());
      dispatch(fetchPaymentStats());
      dispatch(fetchInvoices());
    } else {
      toast.error(r.payload || "Failed to record payment");
    }
  } finally {
    setSubmitting(false);
  }
};

useEffect(() => {
  if (wsRef.current) return;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  const ws = new WebSocket(
    `${protocol}://localhost:8000/ws/notifications/`
  );

  wsRef.current = ws;

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "payment_update") {
      console.log("REALTIME UPDATE:", data);

      dispatch(fetchPayments());
      dispatch(fetchPaymentStats());
      dispatch(fetchInvoices());

      toast.success("Payment updated in real-time");
    }
  };

  ws.onerror = (err) => {
    console.error(" WS error:", err);
  };

  ws.onclose = () => {
    console.log(" WS closed");
  };

  return () => {
    ws.close();
    wsRef.current = null;
  };
}, []);

  const resetForm = () => setForm({ invoice_id: "", amount: "", payment_type: "deposit", payment_method: "mpesa", phone_number: "" });

  const inputCls = "w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all";
  const labelCls = "block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5";

  const statusCfg = {
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
    pending: "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
    failed: "bg-red-100 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
  };
  const typeCfg = {
    deposit: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
    balance: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
    full: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  const StatCard = ({ icon: Icon, value, label, bg, color, shadow }) => (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 transition-colors duration-300">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0 shadow-lg ${shadow}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate tabular-nums">{value}</p>
      </div>
    </div>
  );

  const Badge = ({ children, config }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}>{children}</span>
  );

  //Mobile Card 
  const PaymentCard = ({ p }) => {
    const inv = getInvoice(p.invoice);
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 space-y-4 transition-colors duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{p.payment_number}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{fmtDate(p.created_at)}</p>
          </div>
          <Badge config={statusCfg[p.status] || statusCfg.pending}>{p.status_display || p.status}</Badge>
        </div>
        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">KES {(p.amount || 0).toLocaleString()}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-400 dark:text-stone-500">
          <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" />{p.invoice_number || `INV-${p.invoice}`}</span>
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{inv?.order_number || `ORD-${inv?.order}`}</span>
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            {p.payment_method === "mpesa" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            {p.payment_method_display || p.payment_method}
          </span>
        </div>
        <Badge config={typeCfg[p.payment_type] || typeCfg.deposit}>{p.payment_type_display || p.payment_type}</Badge>
      </div>
    );
  };

  const EmptyState = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-stone-300 dark:text-stone-600" />
      </div>
      <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{text}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{search ? "Try a different search term" : "Payments will appear here once recorded"}</p>
    </div>
  );

  const selectedInvoice = getInvoice(parseInt(form.invoice_id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#c2410c]" />
            </div>
            Payments
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">Track all payment transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98] transition-all"
        >
          <CreditCard className="w-4 h-4" />
          {isAdmin ? "Record Payment" : "Make Payment"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} value={`KES ${(stats?.total_revenue || 0).toLocaleString()}`} label="Total Revenue" bg="bg-gradient-to-br from-emerald-500 to-teal-600" color="text-white" shadow="shadow-emerald-500/20" />
        <StatCard icon={CreditCard} value={stats?.total_payments || payments?.length || 0} label="Total Payments" bg="bg-gradient-to-br from-blue-500 to-indigo-600" color="text-white" shadow="shadow-blue-500/20" />
        <StatCard icon={Clock} value={stats?.pending || 0} label="Pending" bg="bg-gradient-to-br from-amber-500 to-orange-600" color="text-white" shadow="shadow-amber-500/20" />
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Table Header with Search */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Transactions</h2>
              {filtered?.length > 0 && (
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">{filtered.length} result{filtered.length !== 1 && "s"}</span>
              )}
            </div>
            {isAdmin && (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search payment or invoice..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered?.length === 0 ? (
            <EmptyState text={search ? "No payments match your search" : "No payments yet"} />
          ) : (
            filtered.map((p) => <PaymentCard key={p.id} p={p} />)
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                {["Payment #", "Invoice", "Order", isAdmin ? "Client" : null, "Amount", "Type", "Method", "Status", "Date"].filter(Boolean).map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-stone-400 dark:text-stone-500">Loading payments...</p>
                  </td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr><td colSpan="9"><EmptyState text={search ? "No payments match your search" : "No payments yet"} /></td></tr>
              ) : (
                filtered.map((p) => {
                  const inv = getInvoice(p.invoice);
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">{p.payment_number}</td>
                      <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">{p.invoice_number || `INV-${p.invoice}`}</td>
                      <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">{inv?.order_number || `ORD-${inv?.order}`}</td>
                      {isAdmin && (
                        <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                            {inv?.client_name || "—"}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-3.5 text-sm font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap tabular-nums">KES {(p.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge config={typeCfg[p.payment_type] || typeCfg.deposit}>{p.payment_type_display || p.payment_type}</Badge>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                          {p.payment_method === "mpesa" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                          {p.payment_method_display || p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge config={statusCfg[p.status] || statusCfg.pending}>{p.status_display || p.status}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-stone-400 dark:text-stone-500 whitespace-nowrap tabular-nums">{fmtDate(p.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: "overlay-in .25s ease forwards" }}>
          <div className="absolute inset-0 bg-[#1c1917]/50 dark:bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl shadow-stone-900/10 dark:shadow-black/40 border border-stone-200/60 dark:border-stone-700 overflow-hidden flex flex-col max-h-[90vh]" style={{ animation: "modal-in .4s cubic-bezier(.16,1,.3,1) forwards" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center shadow-sm">
                  {form.payment_method === "mpesa" ? <Smartphone className="w-5 h-5 text-[#c2410c]" /> : <CreditCard className="w-5 h-5 text-[#c2410c]" />}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{isAdmin ? "Record Payment" : "Make Payment"}</h3>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Select an invoice to proceed</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-100 dark:border-stone-700 flex items-center justify-center transition-colors active:scale-95">
                <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              <div className="p-6 space-y-5 flex-1">
                {/* Invoice Select */}
                <div>
                  <label className={labelCls}>Invoice <span className="text-[#c2410c]">*</span></label>
                  <select
                    value={form.invoice_id}
                    onChange={(e) => {
                      const inv = getInvoice(parseInt(e.target.value));
                      setForm({ ...form, invoice_id: e.target.value, amount: inv?.balance_due ? inv.balance_due.toString() : "" });
                    }}
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="">Select invoice</option>
                    {invoices?.filter((i) => i.status !== "cancelled").map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.invoice_number} — Balance: KES {(inv.balance_due || 0).toLocaleString()}</option>
                    ))}
                  </select>
                  {selectedInvoice && (
                    <div className="mt-2 px-3 py-2 bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/10 dark:border-[#c2410c]/15 rounded-lg flex items-center justify-between">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Balance due</span>
                      <span className="text-sm font-bold text-[#c2410c] tabular-nums">KES {(selectedInvoice.balance_due || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className={labelCls}>Payment Method <span className="text-[#c2410c]">*</span></label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[{ val: "mpesa", icon: Smartphone, label: "M-Pesa", desc: "Mobile money" }, ...(isAdmin ? [{ val: "cash", icon: CreditCard, label: "Cash", desc: "Manual entry" }, { val: "card", icon: CreditCard, label: "Card", desc: "Manual entry" }] : [])].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => setForm({ ...form, payment_method: m.val })}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                          form.payment_method === m.val
                            ? "border-[#c2410c]/30 bg-[#fff7ed] dark:bg-[#c2410c]/10 dark:border-[#c2410c]/20"
                            : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/80"
                        }`}
                      >
                        <m.icon className={`w-5 h-5 shrink-0 ${form.payment_method === m.val ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"}`} />
                        <div>
                          <p className={`text-sm font-semibold ${form.payment_method === m.val ? "text-[#c2410c]" : "text-stone-700 dark:text-stone-300"}`}>{m.label}</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields */}
                {form.payment_method === "mpesa" && !isAdmin ? (
                  
                  <div>
                    <label className={labelCls}>Phone Number <span className="text-[#c2410c]">*</span></label>
                    <input
                      type="tel"
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                      placeholder="2547XXXXXXXX"
                      inputMode="numeric"
                      autoComplete="tel"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">Format: 254 followed by 9 digits</p>
                  </div>
                ) : (
                  <>
                  {form.payment_method === "mpesa" && isAdmin && (
                  <p className="text-sm text-stone-500">
                    Client will complete payment via M-Pesa from their phone.
                  </p>
                  )}
                    <div>
                      <label className={labelCls}>Amount (KES) <span className="text-[#c2410c]">*</span></label>
                      <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputMode="decimal" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Payment Type</label>
                      <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} className={inputCls + " appearance-none cursor-pointer"}>
                        <option value="deposit">Deposit</option>
                        <option value="balance">Balance</option>
                        <option value="full">Full Payment</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              
              <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 text-sm font-bold hover:bg-stone-100 dark:hover:bg-stone-700 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.invoice_id}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : form.payment_method === "mpesa" ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {submitting ? "Processing..." : form.payment_method === "mpesa" ? "Pay via M-Pesa" : "Record Payment"}
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