import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, recordPayment, fetchPaymentStats, initiateMpesaPayment, fetchInvoices } from "@/store/slices/paymentsSlice";
import { fetchOrders } from "@/store/slices/ordersSlice";
import toast from "react-hot-toast";
import { CreditCard, Smartphone, TrendingUp, Clock, Search } from "lucide-react";

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, stats, loading, invoices } = useSelector((s) => s.payments);
  const { user } = useSelector((s) => s.auth);
  const { orders } = useSelector((s) => s.orders);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ invoice_id: "", amount: "", payment_type: "deposit", payment_method: "mpesa", phone_number: "" });

  useEffect(() => { dispatch(fetchPayments()); dispatch(fetchPaymentStats()); dispatch(fetchInvoices()); if (isAdmin) dispatch(fetchOrders()); }, [dispatch]);

  const filtered = payments?.filter((p) => !search || p.payment_number?.toLowerCase().includes(search.toLowerCase()) || p.invoice_number?.toLowerCase().includes(search.toLowerCase()));

  const getInvoice = (invId) => invoices?.find((i) => i.id === invId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice_id) return toast.error("Select an invoice");
    const inv = getInvoice(parseInt(form.invoice_id));
    if (form.payment_method === "mpesa") {
      let phone = form.phone_number.replace(/\D/g, "");
      if (phone.startsWith("0")) phone = "254" + phone.substring(1);
      if (!phone.startsWith("254") || phone.length !== 12) return toast.error("Phone: 2547XXXXXXXX");
      const r = await dispatch(initiateMpesaPayment({ invoice_id: parseInt(form.invoice_id), phone_number: phone }));
      initiateMpesaPayment.fulfilled.match(r) ? (toast.success("Check your phone for M-Pesa prompt"), setShowModal(false)) : toast.error(r.payload || "Failed");
    } else {
      if (!form.amount) return toast.error("Enter amount");
      const r = await dispatch(recordPayment({ invoice_id: parseInt(form.invoice_id), amount: parseFloat(form.amount), payment_type: form.payment_type, payment_method: form.payment_method }));
      recordPayment.fulfilled.match(r) ? (toast.success("Payment recorded"), setShowModal(false)) : toast.error(r.payload || "Failed");
    }
  };

  const cls = "w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-500">Track all payment transactions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-sm"><CreditCard className="w-4 h-4" />{isAdmin ? "Record Payment" : "Make Payment"}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `KES ${(stats?.total_revenue || 0).toLocaleString()}`, icon: TrendingUp, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
          { label: "Total Payments", value: stats?.total_payments || payments?.length || 0, icon: CreditCard, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
          { label: "Pending", value: stats?.pending || 0, icon: Clock, bg: "bg-yellow-100 dark:bg-yellow-900/30", color: "text-yellow-600 dark:text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div><div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div></div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by payment or invoice number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{["Payment #", "Invoice", "Order", isAdmin ? "Client" : null, "Amount", "Type", "Method", "Status", "Date"].filter(Boolean).map((h) => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr> : filtered?.length === 0 ? <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-500">No payments yet</td></tr> : filtered.map((p) => {
                const inv = getInvoice(p.invoice);
                const ord = orders?.find((o) => o.id === inv?.order);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium">{p.payment_number}</td>
                    <td className="px-6 py-4 text-sm">{p.invoice_number || `INV-${p.invoice}`}</td>
                    <td className="px-6 py-4 text-sm">{inv?.order_number || `ORD-${inv?.order}`}</td>
                    {isAdmin && <td className="px-6 py-4 text-sm">{inv?.client_name || "Client"}</td>}
                    <td className="px-6 py-4 text-sm font-semibold">KES {(p.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.payment_type === "deposit" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : p.payment_type === "balance" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>{p.payment_type_display || p.payment_type}</span></td>
                    <td className="px-6 py-4 text-sm"><span className="flex items-center gap-1.5">{p.payment_method === "mpesa" && <Smartphone className="w-4 h-4 text-green-500" />}{p.payment_method_display || p.payment_method}</span></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : p.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{p.status_display || p.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-lg">{isAdmin ? "Record Payment" : "Make Payment"}</h3><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div><label className="block text-sm font-medium mb-1.5">Invoice *</label><select value={form.invoice_id} onChange={(e) => { const inv = getInvoice(parseInt(e.target.value)); setForm({ ...form, invoice_id: e.target.value, amount: inv?.balance_due ? inv.balance_due.toString() : "" }); }} className={cls}><option value="">Select invoice</option>{invoices.filter((i) => i.status !== "paid").map((inv) => <option key={inv.id} value={inv.id}>{inv.invoice_number} — Balance: KES {(inv.balance_due || 0).toLocaleString()}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1.5">Method *</label><select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className={cls}><option value="mpesa">M-Pesa</option>{isAdmin && <><option value="cash">Cash</option><option value="card">Card</option></>}</select></div>
              {form.payment_method === "mpesa" ? (
                <div><label className="block text-sm font-medium mb-1.5">Phone *</label><input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="2547XXXXXXXX" className={cls} /></div>
              ) : (
                <><div><label className="block text-sm font-medium mb-1.5">Amount (KES) *</label><input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={cls} /></div>
                <div><label className="block text-sm font-medium mb-1.5">Payment Type</label><select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} className={cls}><option value="deposit">Deposit (70%)</option><option value="balance">Balance (30%)</option><option value="full">Full Payment</option></select></div></>
              )}
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button><button type="submit" className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-sm">{form.payment_method === "mpesa" ? "Pay via M-Pesa" : "Record Payment"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;