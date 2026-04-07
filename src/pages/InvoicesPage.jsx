import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, downloadInvoice, sendInvoice } from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import { FileText, Download, Send, Search, AlertTriangle, CheckCircle } from "lucide-react";

const InvoicesPage = () => {
  const dispatch = useDispatch();
  const { invoices, loading } = useSelector((s) => s.payments);
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchInvoices()); }, [dispatch]);

  const filtered = invoices?.filter((inv) => !search || inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) || inv.order_number?.toLowerCase().includes(search.toLowerCase()) || inv.client_name?.toLowerCase().includes(search.toLowerCase()));

  const pendingDeposit = filtered?.filter((i) => !i.is_deposit_paid && i.status !== "paid" && i.status !== "cancelled");
  const pendingBalance = filtered?.filter((i) => i.is_deposit_paid && i.status === "partial");

  const statusBadge = (status) => ({
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    partial: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }[status] || "bg-gray-100 text-gray-700");

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1><p className="text-gray-500">Payment evidence and tracking</p></div>

      {/* Alert banners */}
      {(pendingDeposit?.length > 0 || pendingBalance?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDeposit?.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div><p className="font-medium text-yellow-800 dark:text-yellow-300">{pendingDeposit.length} awaiting deposit</p><p className="text-sm text-yellow-600">70% deposit required before work starts</p></div>
            </div>
          )}
          {pendingBalance?.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div><p className="font-medium text-orange-800 dark:text-orange-300">{pendingBalance.length} awaiting balance</p><p className="text-sm text-orange-600">30% balance before delivery/pickup</p></div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 
        outline-none focus:ring-2 focus:ring-orange-500" />
      </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{["Invoice", "Order", "Client", "Total", "Deposit", "Paid", "Balance", "Status", "Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan="9" className="px-5 py-8 text-center text-gray-500">Loading...</td></tr> : filtered?.length === 0 ? <tr><td colSpan="9" className="px-5 py-8 text-center text-gray-500"><FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />No invoices</td></tr> : filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-4 font-medium text-sm">{inv.invoice_number}</td>
                  <td className="px-5 py-4 text-sm">{inv.order_number}</td>
                  <td className="px-5 py-4 text-sm">{inv.client_name || "Client"}</td>
                  <td className="px-5 py-4 text-sm font-medium">KES {(inv.total_amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm">
                    <div><span className={inv.is_deposit_paid ? "text-green-600" : "text-red-500"}>{(inv.deposit_amount || 0).toLocaleString()}</span><p className="text-xs text-gray-400">Paid: {(inv.deposit_paid || 0).toLocaleString()}</p></div>
                  </td>
                  <td className="px-5 py-4 text-sm text-green-600 font-medium">KES {(inv.amount_paid || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-orange-600">KES {(inv.balance_due || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(inv.status)}`}>{inv.status_display || inv.status}</span>
                      {inv.is_deposit_paid && inv.status !== "paid" && <CheckCircle className="w-4 h-4 text-green-500" title="Deposit paid" />}
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="flex gap-1"><button onClick={async () => { try { await dispatch(downloadInvoice(inv.id)); toast.success("Downloaded"); } catch { toast.error("Failed"); } }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download"><Download className="w-4 h-4" /></button><button onClick={async () => { const r = await dispatch(sendInvoice(inv.id)); sendInvoice.fulfilled.match(r) ? toast.success("Sent to client") : toast.error("Failed"); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Send to client"><Send className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;