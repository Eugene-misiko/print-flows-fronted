import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, downloadInvoice, sendInvoice } from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import { FileText, Download, Send, Clock, AlertCircle } from "lucide-react";

const InvoicesPage = () => {
  const dispatch = useDispatch();
  const { invoices, pendingDeposit, pendingBalance, loading: isLoading } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleDownload = async (id) => {
    try {
      await dispatch(downloadInvoice(id));
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  const handleSend = async (id) => {
    const result = await dispatch(sendInvoice(id));
    if (sendInvoice.fulfilled.match(result)) {
      toast.success("Invoice sent to client");
    } else {
      toast.error("Failed to send");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage invoices and payments</p>
      </div>

      {/* Pending Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingDeposit?.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex items-center gap-3 transition-colors">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Pending Deposit Invoices</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">70% deposit required to start work</p>
            </div>
          </div>
        )}
        {pendingBalance?.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 flex items-center gap-3 transition-colors">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">Pending Balance Invoices</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">30% balance pending completion</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : invoices?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    No invoices yet
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">{invoice.invoice_number || `INV-${invoice.id}`}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{invoice.order_number || `Order #${invoice.order}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{invoice.client_name || "Client"}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">KES {(invoice.total_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 dark:text-green-400 font-medium">KES {(invoice.amount_paid || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-orange-600 dark:text-orange-400 font-medium">KES {(invoice.balance_due || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : invoice.status === "partial" 
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" 
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {invoice.status_display || invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(invoice.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSend(invoice.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Send to client"
                        >
                          <Send className="w-4 h-4" />
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