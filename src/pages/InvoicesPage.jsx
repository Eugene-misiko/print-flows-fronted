import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, downloadInvoice, sendInvoice} from "@/store/slices/paymentsSlice";
import toast from "react-hot-toast";
import { FileText, Download, Send, Clock, AlertCircle } from "lucide-react";

const InvoicesPage = () => {
  const dispatch = useDispatch();
  const { invoices, pendingDeposit, pendingBalance, loading: isLoading } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchInvoices()); 
    // dispatch(fetchPendingDepositInvoices()); 
    // dispatch(fetchPendingBalanceInvoices()); 
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500">Manage invoices and payments</p>
      </div>

      {/* Pending Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingDeposit?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Pending Deposit Invoices</p>
              <p className="text-sm text-yellow-600">70% deposit required to start work</p>
            </div>
          </div>
        )}
        {pendingBalance?.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Pending Balance Invoices</p>
              <p className="text-sm text-orange-600">30% balance pending completion</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : invoices?.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  No invoices yet
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{invoice.invoice_number || `INV-${invoice.id}`}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{invoice.order_number || `Order #${invoice.order}`}</td>
                  <td className="px-4 py-3 text-sm">{invoice.client_name || "Client"}</td>
                  <td className="px-4 py-3 font-medium">KES {(invoice.total_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">KES {(invoice.amount_paid || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-orange-600 font-medium">KES {(invoice.balance_due || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === "paid" ? "bg-green-100 text-green-700" :
                      invoice.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {invoice.status_display || invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(invoice.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSend(invoice.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
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
  );
};

export default InvoicesPage;