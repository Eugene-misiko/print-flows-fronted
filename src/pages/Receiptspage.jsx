
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReceipts, downloadReceipt } from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import {Receipt,Download,Search,X,Inbox,Smartphone,CreditCard,Banknote,CheckCircle2,Hash,Calendar, TrendingUp, FileCheck, User, ShoppingBag, Loader2,Sparkles,} from "lucide-react";
// Helpers 

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtAmount(n) {
  return Number(n || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const METHOD_ICON = {
  mpesa: Smartphone,
  cash: Banknote,
  card: CreditCard,
};

const METHOD_COLOR = {
  mpesa: "text-emerald-600 dark:text-emerald-400",
  cash: "text-amber-600 dark:text-amber-400",
  card: "text-blue-600 dark:text-blue-400",
};

const METHOD_BG = {
  mpesa: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/30",
  cash: "bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-800/30",
  card: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/60 dark:border-blue-800/30",
};

const TYPE_CFG = {
  deposit: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  balance: "bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  full: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
};

// ─── Sub-components 

const Badge = ({ children, config }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}>
    {children}
  </span>
);

const StatCard = ({ icon: Icon, value, label, sublabel, gradient, shadow, delay }) => (
  <div
    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 transition-all duration-300"
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shrink-0 shadow-lg ${shadow}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate tabular-nums">{value}</p>
      {sublabel && <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

// ─── Main Component 

const ReceiptsPage = () => {
  const dispatch = useDispatch();
  const { receipts, receiptsLoading } = useSelector((s) => s.payments);
  const { user } = useSelector((s) => s.auth);

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);

  //  Search filter 
  const filtered = receipts?.filter((r) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      r.receipt_number?.toLowerCase().includes(t) ||
      r.order_number?.toLowerCase().includes(t) ||
      r.mpesa_receipt?.toLowerCase().includes(t) ||
      r.invoice?.toString().includes(t)
    );
  });

  // ── Stats 
  const totalCollected = receipts?.reduce((s, r) => s + Number(r.amount_paid || 0), 0) ?? 0;
  const mpesaCount = receipts?.filter((r) => r.mpesa_receipt)?.length ?? 0;

  // ── Download handler 
  const handleDownload = useCallback(
    async (id) => {
      setDownloading(id);
      const result = await dispatch(downloadReceipt(id));
      if (downloadReceipt.fulfilled.match(result)) {
        toast.success("Receipt downloaded.");
      } else {
        toast.error("Failed to download receipt.");
      }
      setDownloading(null);
    },
    [dispatch]
  );

  // ── CSS helpers 
  const inputCls =
    "w-full pl-10 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all";

  // ── Mobile receipt card 
  const ReceiptCard = ({ r, idx }) => {
    const MethodIcon = METHOD_ICON[r.payment_method] ?? CreditCard;
    const methodColor = METHOD_COLOR[r.payment_method] ?? METHOD_COLOR.card;
    const methodBg = METHOD_BG[r.payment_method] ?? METHOD_BG.card;
    const isDownloading = downloading === r.id;

    return (
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 space-y-4 transition-colors duration-300"
        style={{ animationDelay: `${idx * 40}ms` }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center shrink-0">
                <Receipt className="w-3.5 h-3.5 text-[#c2410c]" />
              </div>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {r.receipt_number}
              </p>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 ml-9">
              {fmtDate(r.created_at)} · {fmtTime(r.created_at)}
            </p>
          </div>
          <button
            onClick={() => handleDownload(r.id)}
            disabled={isDownloading}
            className="w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-[#c2410c] hover:border-[#c2410c]/20 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#c2410c]" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider">
              Amount Paid
            </p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums mt-0.5">
              KES {fmtAmount(r.amount_paid)}
            </p>
          </div>
          <Badge config={TYPE_CFG[r.payment_type] ?? TYPE_CFG.deposit}>
            {r.payment_type}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mb-1">
              Order
            </p>
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300 truncate">
              {r.order_number || "—"}
            </p>
          </div>
          <div className="px-3 py-2 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mb-1">
              Invoice
            </p>
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300 truncate">
              INV-{r.invoice}
            </p>
          </div>
        </div>

        {/* M-Pesa code or method */}
        {r.mpesa_receipt ? (
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${methodBg}`}>
            <MethodIcon className={`w-4 h-4 shrink-0 ${methodColor}`} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                M-Pesa Code
              </p>
              <p className={`text-sm font-bold font-mono tracking-wide ${methodColor}`}>
                {r.mpesa_receipt}
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
          </div>
        ) : (
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${methodBg}`}>
            <MethodIcon className={`w-4 h-4 shrink-0 ${methodColor}`} />
            <p className={`text-sm font-semibold capitalize ${methodColor}`}>
              {r.payment_method || "Manual"}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ── Empty state 
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-stone-300 dark:text-stone-600" />
      </div>
      <p className="text-sm font-bold text-stone-500 dark:text-stone-400">
        {search ? "No receipts match your search" : "No receipts yet"}
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
        {search
          ? "Try a different search term"
          : "Receipts are generated automatically after successful payments"}
      </p>
    </div>
  );

  // ── Render
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header  */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-[#c2410c]" />
            </div>
            Receipts
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">
            Payment confirmations and proof of payment
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Auto-generated on payment
          </span>
        </div>
      </div>

      {/* ── Stats  */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileCheck}
          value={receipts?.length ?? 0}
          label="Total Receipts"
          sublabel="All time"
          gradient="bg-gradient-to-br from-[#c2410c] to-[#ea580c]"
          shadow="shadow-orange-500/20"
          delay="0ms"
        />
        <StatCard
          icon={TrendingUp}
          value={`KES ${fmtAmount(totalCollected)}`}
          label="Total Collected"
          sublabel="Across all receipts"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
          delay="60ms"
        />
        <StatCard
          icon={Smartphone}
          value={mpesaCount}
          label="M-Pesa Payments"
          sublabel={`${receipts?.length ? Math.round((mpesaCount / receipts.length) * 100) : 0}% of total`}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          shadow="shadow-green-500/20"
          delay="120ms"
        />
      </div>

      {/* ── Main Table Card  */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">

        {/* Table header + search */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                All Receipts
              </h2>
              {filtered?.length > 0 && (
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">
                  {filtered.length} result{filtered.length !== 1 && "s"}
                </span>
              )}
            </div>
            <div className="relative sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Receipt #, order, M-Pesa code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
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
          </div>
        </div>

        {/* ── Mobile Cards  */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800/60 p-4 space-y-3">
          {receiptsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered?.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((r, idx) => <ReceiptCard key={r.id} r={r} idx={idx} />)
          )}
        </div>

        {/* ── Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                {[
                  "Receipt #",
                  "Order",
                  isAdmin ? "Client" : null,
                  "Amount Paid",
                  "Type",
                  "M-Pesa Code",
                  "Method",
                  "Date & Time",
                  "",
                ]
                  .filter(Boolean)
                  .map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {receiptsLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-stone-400 dark:text-stone-500">
                      Loading receipts…
                    </p>
                  </td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const MethodIcon = METHOD_ICON[r.payment_method] ?? CreditCard;
                  const methodColor = METHOD_COLOR[r.payment_method] ?? METHOD_COLOR.card;
                  const isDownloading = downloading === r.id;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group"
                    >
                      {/* Receipt # */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center shrink-0">
                            <Receipt className="w-3.5 h-3.5 text-[#c2410c]" />
                          </div>
                          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                            {r.receipt_number}
                          </span>
                        </div>
                      </td>

                      {/* Order */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                            {r.order_number || "—"}
                          </span>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500">
                            INV-{r.invoice}
                          </span>
                        </div>
                      </td>

                      {/* Client (admin only) */}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                              <User className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                            </div>
                            <span className="text-sm text-stone-600 dark:text-stone-400">
                              {r.client_name || "—"}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                          KES {fmtAmount(r.amount_paid)}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge config={TYPE_CFG[r.payment_type] ?? TYPE_CFG.deposit}>
                          {r.payment_type}
                        </Badge>
                      </td>

                      {/* M-Pesa code */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.mpesa_receipt ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                              {r.mpesa_receipt}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-stone-300 dark:text-stone-600">—</span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon className={`w-4 h-4 ${methodColor}`} />
                          <span className={`text-sm font-medium capitalize ${methodColor}`}>
                            {r.payment_method || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-stone-600 dark:text-stone-400 tabular-nums">
                            {fmtDate(r.created_at)}
                          </span>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 tabular-nums">
                            {fmtTime(r.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Download */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDownload(r.id)}
                          disabled={isDownloading}
                          title="Download PDF"
                          className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-[#c2410c] hover:border-[#c2410c]/20 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2410c]" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        {filtered?.length > 0 && !receiptsLoading && (
          <div className="px-6 py-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Receipts are generated automatically after every successful payment.
              Download as PDF for your records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsPage;