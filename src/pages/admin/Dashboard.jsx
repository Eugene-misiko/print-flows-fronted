import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../../store/slices/companySlice";
import { fetchOrders, fetchUnassigned } from "../../store/slices/ordersSlice";
import { fetchInvoices } from "../../store/slices/paymentsSlice";
import { ShoppingBag, Users, DollarSign, Clock, TrendingUp, AlertCircle, Plus } from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, isLoading: dashboardLoading } = useSelector((state) => state.company);
  const { orders, unassigned, isLoading: ordersLoading } = useSelector((state) => state.orders);
  const { invoices } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchOrders({ limit: 10 }));
    dispatch(fetchUnassigned());
    dispatch(fetchInvoices({ limit: 5 }));
  }, [dispatch]);

  const stats = [
    {
      title: "Total Orders",
      value: dashboard?.total_orders || orders?.length || 0,
      icon: ShoppingBag,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Active Staff",
      value: dashboard?.active_staff || 0,
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Revenue",
      value: `KES ${(dashboard?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Unassigned",
      value: unassigned?.length || 0,
      icon: AlertCircle,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of your printing business</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-orange-600 hover:text-orange-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {ordersLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : orders?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p>No orders yet</p>
                <Link to="/orders/new" className="text-orange-600 text-sm hover:underline">
                  Create your first order
                </Link>
              </div>
            ) : (
              orders?.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="p-4 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number || `Order #${order.id}`}</p>
                    <p className="text-sm text-gray-500">{order.user_name || "Client"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">KES {(order.total_price || 0).toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      order.status === "cancelled" ? "bg-gray-100 text-gray-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pending Invoices</h2>
            <Link to="/invoices" className="text-sm text-orange-600 hover:text-orange-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices?.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoice_number || `INV-${invoice.id}`}</p>
                    <p className="text-sm text-gray-500">{invoice.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600">
                      KES {(invoice.balance_due || invoice.total_amount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.is_deposit_paid ? "Balance pending" : "Deposit pending"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unassigned Orders Alert */}
      {unassigned?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">
                {unassigned.length} order{unassigned.length > 1 ? "s" : ""} awaiting assignment
              </p>
              <p className="text-sm text-yellow-600">
                Assign designers and printers to start processing orders
              </p>
            </div>
            <Link
              to="/orders"
              className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
            >
              View Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
