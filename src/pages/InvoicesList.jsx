import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText, Search, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { fetchInvoices } from "../store/slices/paymentsSlice";

const InvoicesList = () => {
  const dispatch = useDispatch();
  const { invoices, isLoading } = useSelector((state) => state.payments);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchInvoices({ search: searchTerm, status: statusFilter }));
  }, [dispatch, searchTerm, statusFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (isPaid) => {
    return isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">View and manage invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Invoice</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Order</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Deposit</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Due Date</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-900">#{invoice.invoice_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    #{invoice.order?.order_number}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCurrency(invoice.amount_due)} (70%)
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.is_paid)}`}>
                      {invoice.is_paid ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {invoice.is_paid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(invoice.due_date)}</td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No invoices found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesList;
