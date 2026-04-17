import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, downloadInvoice, sendInvoice } from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import { FileText, Download, Send, Search, AlertTriangle, CheckCircle, X, Inbox, Clock, CreditCard } from "lucide-react";

const InvoicesPage = () => {
  const dispatch = useDispatch();
  const { invoices, loading } = useSelector((s) => s.payments);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [sending, setSending] = useState(null);

  useEffect(() => { dispatch(fetchInvoices()); }, [dispatch]);

  const filtered = invoices?.filter(
    (inv) =>
      !search ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingDeposit = filtered?.filter((i) => !i.is_deposit_paid && i.status !== "paid" && i.status !== "cancelled");
  const pendingBalance = filtered?.filter((i) => i.is_deposit_paid && i.status === "partial");

  const statusCfg = {
    draft: "bg-stone-100 text-stone-600 border-stone-200/60 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700/60",
    pending: "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
    partial: "bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
    cancelled: "bg-red-100 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
  };

  const Badge = ({ children, config }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${config}`}>{children}</span>
  );

  const handleDownload = async (id) => {
    setDownloading(id);
    try { await dispatch(downloadInvoice(id)); toast.success("Downloaded"); }
    catch { toast.error("Failed to download"); }
    finally { setDownloading(null); }
  };

  const handleSend = async (id) => {
    setSending(id);
    const r = await dispatch(sendInvoice(id));
    sendInvoice.fulfilled.match(r) ? toast.success("Sent to client") : toast.error("Failed to send");
    setSending(null);
  };

  const inputCls = "w-full pl-10 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all";

  // ─── Mobile Card ─────────────────────────────────────────
  const InvoiceCard = ({ inv }) => (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 space-y-4 transition-colors duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{inv.invoice_number}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{inv.order_number} · {inv.client_name || "Client"}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {inv.is_deposit_paid && inv.status !== "paid" && <CheckCircle className="w-4 h-4 text-emerald-500" title="Deposit paid" />}
          <Badge config={statusCfg[inv.status] || statusCfg.draft}>{inv.status_display || inv.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Total</p>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums mt-1">KES {(inv.total_amount || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Paid</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">KES {(inv.amount_paid || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Balance</p>
          <p className={`text-sm font-bold tabular-nums mt-1 ${(inv.balance_due || 0) > 0 ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"}`}>KES {(inv.balance_due || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
        <span className="text-xs text-stone-400 dark:text-stone-500">
          Deposit: <span className={inv.is_deposit_paid ? "text-emerald-500 font-semibold" : "text-[#c2410c] font-semibold"}>{inv.is_deposit_paid ? "Paid" : "Unpaid"}</span>
          <span className="text-stone-300 dark:text-stone-600 mx-1">·</span>
          KES {(inv.deposit_paid || 0).toLocaleString()} / {(inv.deposit_amount || 0).toLocaleString()}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => handleDownload(inv.id)} disabled={downloading === inv.id} className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-[#c2410c] hover:border-[#c2410c]/20 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-all active:scale-95 disabled:opacity-50">
            {downloading === inv.id ? <div className="w-3.5 h-3.5 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => handleSend(inv.id)} disabled={sending === inv.id} className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-[#c2410c] hover:border-[#c2410c]/20 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-all active:scale-95 disabled:opacity-50">
            {sending === inv.id ? <div className="w-3.5 h-3.5 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#c2410c]" />
          </div>
          Invoices
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">Payment evidence and tracking</p>
      </div>

      {/* Alert Banners */}
      {(pendingDeposit?.length > 0 || pendingBalance?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDeposit?.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{pendingDeposit.length} awaiting deposit</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">70% deposit required before work begins</p>
              </div>
            </div>
          )}
          {pendingBalance?.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/15 border border-orange-200/60 dark:border-orange-800/30 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-orange-800 dark:text-orange-300">{pendingBalance.length} awaiting balance</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-0.5">30% balance due before delivery or pickup</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Header + Search */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">All Invoices</h2>
              {filtered?.length > 0 && (
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">{filtered.length} result{filtered.length !== 1 && "s"}</span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search invoice, order, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{search ? "No invoices match your search" : "No invoices yet"}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{search ? "Try a different search term" : "Invoices are generated when orders are placed"}</p>
            </div>
          ) : (
            filtered.map((inv) => <InvoiceCard key={inv.id} inv={inv} />)
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                {["Invoice", "Order", "Client", "Total", "Deposit", "Paid", "Balance", "Status", ""].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-stone-400 dark:text-stone-500">Loading invoices...</p>
                  </td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
                        <Inbox className="w-6 h-6 text-stone-300 dark:text-stone-600" />
                      </div>
                      <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{search ? "No invoices match your search" : "No invoices yet"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">{inv.order_number}</td>
                    <td className="px-6 py-3.5 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">{inv.client_name || "Client"}</td>
                    <td className="px-6 py-3.5 text-sm font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap tabular-nums">KES {(inv.total_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <p className={`text-sm font-semibold tabular-nums ${inv.is_deposit_paid ? "text-emerald-600 dark:text-emerald-400" : "text-[#c2410c]"}`}>KES {(inv.deposit_amount || 0).toLocaleString()}</p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 tabular-nums">Paid: KES {(inv.deposit_paid || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">KES {(inv.amount_paid || 0).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-sm font-bold whitespace-nowrap tabular-nums">
                      <span className={(inv.balance_due || 0) > 0 ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"}>KES {(inv.balance_due || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Badge config={statusCfg[inv.status] || statusCfg.draft}>{inv.status_display || inv.status}</Badge>
                        {inv.is_deposit_paid && inv.status !== "paid" && <CheckCircle className="w-4 h-4 text-emerald-500" title="Deposit paid" />}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleDownload(inv.id)} disabled={downloading === inv.id} className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-[#c2410c] hover:border-[#c2410c]/20 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-all active:scale-95 disabled:opacity-50" title="Download">
                          {downloading === inv.id ? <div className="w-3.5 h-3.5 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleSend(inv.id)} disabled={sending === inv.id} className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-[#c2410c] hover:border-[#c2410c]/20 hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 transition-all active:scale-95 disabled:opacity-50" title="Send to client">
                          {sending === inv.id ? <div className="w-3.5 h-3.5 border-2 border-[#c2410c] border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;