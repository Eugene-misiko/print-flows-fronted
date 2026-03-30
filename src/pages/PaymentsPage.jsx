import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchPayments,recordPayment,fetchPaymentStats, initiateMpesaPayment, fetchInvoices} from "@/store/slices/paymentsSlice";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage payments</p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 cursor-pointer text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
        >
          <CreditCard className="w-4 h-4" />
          Make Payment
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                KES {(paymentStats?.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        {/* Total Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paymentStats?.total_payments || payments?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        {/* Pending Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paymentStats?.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
      {/* Payments Table Container */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : payments?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No payments yet
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {payment.invoice_number || `INV-${payment.invoice}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      KES {(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        {payment.payment_method === "mpesa" && (
                          <Smartphone className="w-4 h-4 text-green-500" />
                        )}
                        {payment.payment_method_display || payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {payment.payment_type_display || payment.payment_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                        {payment.status_display || payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 transform scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Make Payment</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <span className="text-xl">&times;</span>
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleMpesaPayment} className="p-6 space-y-5">
              {/* Invoice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentForm.invoice_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" >
                  <option value="" className="text-gray-500">Select invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id} className="dark:bg-gray-700">
                      {inv.invoice_number || `INV-${inv.id}`} - KES {(inv.balance_due || inv.total_amount)?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors">
                  <option value="mpesa" className="dark:bg-gray-700">M-Pesa</option>
                  {isAdmin && (
                    <>
                      <option value="cash" className="dark:bg-gray-700">Cash</option>
                      <option value="card" className="dark:bg-gray-700">Card</option>
                    </>
                  )}
                </select>
              </div>
              {paymentForm.payment_method === "mpesa" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={paymentForm.phone_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone_number: e.target.value })}
                    placeholder="2547XXXXXXXX"
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"/>
                </div>
              )}
              {/* Admin Payment Options */}
              {isAdmin && paymentForm.payment_method !== "mpesa" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Payment Type
                    </label>
                    <select
                      value={paymentForm.payment_type}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    >
                      <option value="deposit" className="dark:bg-gray-700">Deposit (70%)</option>
                      <option value="balance" className="dark:bg-gray-700">Balance (30%)</option>
                      <option value="full" className="dark:bg-gray-700">Full Payment</option>
                    </select>
                  </div>
                </>
              )}
              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm">
                  Pay Now
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