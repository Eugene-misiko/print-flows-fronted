import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayments,
  recordPayment,
  fetchPaymentStats,
  initiateMpesaPayment,
  fetchInvoices
} from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import { CreditCard, Smartphone, TrendingUp, Clock } from "lucide-react";

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, stats: paymentStats, loading: isLoading, invoices } = useSelector(
    (state) => state.payments
  );
  const { user } = useSelector((state) => state.auth);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: "",
    amount: "",
    payment_type: "deposit",
    payment_method: "mpesa",
    phone_number: "",
  });

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchPaymentStats());
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleMpesaPayment = async (e) => {
    e.preventDefault();

    if (!paymentForm.invoice_id) return toast.error("Please select an invoice");
    if (!paymentForm.amount) return toast.error("Please enter amount");
    if (paymentForm.payment_method === "mpesa" && !paymentForm.phone_number)
      return toast.error("Please enter phone number");

    if (paymentForm.payment_method === "mpesa") {
      let phone = paymentForm.phone_number.replace(/\D/g, "");
      if (phone.startsWith("0")) phone = "254" + phone.substring(1);
      if (!phone.startsWith("254") || phone.length !== 12)
        return toast.error("Phone must be format: 2547XXXXXXXX");

      const result = await dispatch(
        initiateMpesaPayment({
          invoice_id: parseInt(paymentForm.invoice_id),
          phone_number: phone,
        })
      );

      if (initiateMpesaPayment.fulfilled.match(result)) {
        toast.success("Check your phone for M-Pesa prompt");
        setShowPaymentModal(false);
      } else {
        toast.error(result.payload || "Payment failed");
      }
    } else {
      const result = await dispatch(
        recordPayment({
          invoice_id: parseInt(paymentForm.invoice_id),
          amount: parseFloat(paymentForm.amount),
          payment_type: paymentForm.payment_type,
          payment_method: paymentForm.payment_method,
        })
      );

      if (recordPayment.fulfilled.match(result)) {
        toast.success("Payment recorded");
        setShowPaymentModal(false);
      } else {
        toast.error(result.payload || "Failed to record payment");
      }
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Track and manage payments</p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 cursor-pointer text-white px-4 py-2 rounded-lg"
        >
          <CreditCard className="w-4 h-4" />
          Make Payment 
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {(paymentStats?.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentStats?.total_payments || payments?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between ">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats?.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white rounded-2xl p-6 shadow-lg shadow-sm borde overflow-hidden">
        <table className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white rounded-2xl p-6 shadow-lg">
          <thead className="">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white rounded-2xl p-6 shadow-lg">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : payments?.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No payments yet</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">#{payment.id}</td>
                  <td className="px-4 py-3 text-sm">{payment.invoice_number || `INV-${payment.invoice}`}</td>
                  <td className="px-4 py-3 font-medium">KES {(payment.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm">
                      {payment.payment_method === "mpesa" && (
                        <Smartphone className="w-4 h-4 text-green-600" />
                      )}
                      {payment.payment_method_display || payment.payment_method} 
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {payment.payment_type_display || payment.payment_type} 
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status_display || payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-4">Make Payment</h3>
            <form onSubmit={handleMpesaPayment} className="space-y-4">
              {/* Invoice Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Invoice *</label>
                <select
                  value={paymentForm.invoice_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number || `INV-${inv.id}`} - KES {(inv.balance_due || inv.total_amount)?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
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

              {/* M-Pesa Phone Input */}
              {paymentForm.payment_method === "mpesa" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={paymentForm.phone_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone_number: e.target.value })}
                    placeholder="2547XXXXXXXX"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              {/* Admin Payment Options */}
              {isAdmin && paymentForm.payment_method !== "mpesa" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Type</label>
                    <select
                      value={paymentForm.payment_type}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="deposit">Deposit (70%)</option>
                      <option value="balance">Balance (30%)</option>
                      <option value="full">Full Payment</option>
                    </select>
                  </div>
                </>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border cursor-pointer rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer">
                  Pay
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