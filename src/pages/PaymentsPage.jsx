import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayments,
  recordPayment,
  fetchPaymentStats,
  initiateMpesaPayment,
  fetchInvoices,
} from "@/store/slices/paymentsSlice";
import { fetchOrders } from "@/store/slices/ordersSlice";
import toast from "react-hot-toast";
import {
  CreditCard,
  Smartphone,
  TrendingUp,
  Clock,
  Search,
  FileText,
  Receipt,
  User,
  X,
  Loader2,
  Inbox,
} from "lucide-react";

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, stats, loading, invoices } = useSelector((s) => s.payments);
  const { user } = useSelector((s) => s.auth);
  const { orders } = useSelector((s) => s.orders);
  const isAdmin =
    user?.role === "admin" || user?.role === "platform_admin";
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

  const filtered = payments?.filter(
    (p) =>
      !search ||
      p.payment_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getInvoice = (invId) => invoices?.find((i) => i.id === invId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice_id) return toast.error("Select an invoice");
    setSubmitting(true);

    try {
      if (form.payment_method === "mpesa") {
        let phone = form.phone_number.replace(/\D/g, "");
        if (phone.startsWith("0")) phone = "254" + phone.substring(1);
        if (!phone.startsWith("254") || phone.length !== 12) {
          setSubmitting(false);
          return toast.error("Phone format: 2547XXXXXXXX");
        }
        const r = await dispatch(
          initiateMpesaPayment({
            invoice_id: parseInt(form.invoice_id),
            phone_number: phone,
          })
        );
        if (initiateMpesaPayment.fulfilled.match(r)) {
          toast.success("Check your phone for M-Pesa prompt");
          setShowModal(false);
          resetForm();
        } else {
          toast.error(r.payload || "Failed to initiate M-Pesa");
        }
      } else {
        if (!form.amount) {
          setSubmitting(false);
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
        } else {
          toast.error(r.payload || "Failed to record payment");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () =>
    setForm({
      invoice_id: "",
      amount: "",
      payment_type: "deposit",
      payment_method: "mpesa",
      phone_number: "",
    });

  const cls =
    "w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors";

  const statusConfig = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const typeConfig = {
    deposit: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    balance: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    full: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  // ─── Mobile Card ─────────────────────────────────────────────
  const PaymentCard = ({ p }) => {
    const inv = getInvoice(p.invoice);
    const ord = orders?.find((o) => o.id === inv?.order);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 space-y-3 hover:shadow-md transition-shadow">
        {/* Top row: Payment # + Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {p.payment_number}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(p.created_at).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
              statusConfig[p.status] || statusConfig.pending
            }`}
          >
            {p.status_display || p.status}
          </span>
        </div>

        {/* Amount */}
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          KES {(p.amount || 0).toLocaleString()}
        </p>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Receipt className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{p.invoice_number || `INV-${p.invoice}`}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{inv?.order_number || `ORD-${inv?.order}`}</span>
          </div>
          {isAdmin && inv?.client_name && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2 sm:col-span-1">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{inv.client_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {p.payment_method === "mpesa" && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {p.payment_method_display || p.payment_method}
                </span>
              ) || p.payment_method_display || p.payment_method}
            </span>
          </div>
        </div>

        {/* Type badge */}
        <div>
          <span
            className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
              typeConfig[p.payment_type] || typeConfig.deposit
            }`}
          >
            {p.payment_type_display || p.payment_type}
          </span>
        </div>
      </div>
    );
  };

  // ─── Empty State 
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        No payments found
      </p>
    </div>
  );
  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Payments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl shadow-sm font-medium transition-all"
        >
          <CreditCard className="w-4 h-4" />
          {isAdmin ? "Record Payment" : "Make Payment"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: "Total Revenue",
            value: `KES ${(stats?.total_revenue || 0).toLocaleString()}`,
            icon: TrendingUp,
            bg: "bg-green-100 dark:bg-green-900/30",
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Total Payments",
            value: stats?.total_payments || payments?.length || 0,
            icon: CreditCard,
            bg: "bg-blue-100 dark:bg-blue-900/30",
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Pending",
            value: stats?.pending || 0,
            icon: Clock,
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            color: "text-yellow-600 dark:text-yellow-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}
            >
              <s.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {s.label}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search (admin only) */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payment or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/*  Mobile Cards (below md)  */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : filtered?.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((p) => <PaymentCard key={p.id} p={p} />)
        )}
      </div>

      {/* Desktop Table (md and above) */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
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
                      className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500 mb-2" />
                    Loading payments...
                  </td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const inv = getInvoice(p.invoice);
                  const ord = orders?.find((o) => o.id === inv?.order);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {p.payment_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {p.invoice_number || `INV-${p.invoice}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {inv?.order_number || `ORD-${inv?.order}`}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {inv?.client_name || "—"}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        KES {(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                            typeConfig[p.payment_type] || typeConfig.deposit
                          }`}
                        >
                          {p.payment_type_display || p.payment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          {p.payment_method === "mpesa" && (
                            <Smartphone className="w-4 h-4 text-green-500" />
                          )}
                          {p.payment_method_display || p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            statusConfig[p.status] || statusConfig.pending
                          }`}
                        >
                          {p.status_display || p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col animate-slide-up sm:animate-fade-in"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {isAdmin ? "Record Payment" : "Make Payment"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto"
            >
              {/* Invoice Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.invoice_id}
                  onChange={(e) => {
                    const inv = getInvoice(parseInt(e.target.value));
                    setForm({
                      ...form,
                      invoice_id: e.target.value,
                      amount: inv?.balance_due
                        ? inv.balance_due.toString()
                        : "",
                    });
                  }}
                  className={cls}
                >
                  <option value="">Select invoice</option>
                  {invoices
                    ?.filter((i) => i.status !== "paid")
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} — Balance: KES{" "}
                        {(inv.balance_due || 0).toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({ ...form, payment_method: e.target.value })
                  }
                  className={cls}
                >
                  <option value="mpesa">M-Pesa</option>
                  {isAdmin && (
                    <>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                    </>
                  )}
                </select>
              </div>

              {/* Conditional fields */}
              {form.payment_method === "mpesa" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) =>
                      setForm({ ...form, phone_number: e.target.value })
                    }
                    placeholder="2547XXXXXXXX"
                    className={cls}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Format: 254 followed by 9 digits
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Amount (KES) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      className={cls}
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Payment Type
                    </label>
                    <select
                      value={form.payment_type}
                      onChange={(e) =>
                        setForm({ ...form, payment_type: e.target.value })
                      }
                      className={cls}
                    >
                      <option value="deposit">Deposit (70%)</option>
                      <option value="balance">Balance (30%)</option>
                      <option value="full">Full Payment</option>
                    </select>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : form.payment_method === "mpesa" ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {submitting
                    ? "Processing..."
                    : form.payment_method === "mpesa"
                    ? "Pay via M-Pesa"
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