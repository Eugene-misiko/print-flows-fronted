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
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Staff",
      value: dashboard?.active_staff || 0,
      icon: Users,
      lightBg: "bg-green-50",
      darkBg: "dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Revenue",
      value: `KES ${(dashboard?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      lightBg: "bg-orange-50",
      darkBg: "dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Unassigned",
      value: unassigned?.length || 0,
      icon: AlertCircle,
      lightBg: "bg-yellow-50",
      darkBg: "dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of your printing business</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.lightBg} ${stat.darkBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ordersLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : orders?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p>No orders yet</p>
                <Link to="/orders/new" className="text-orange-600 dark:text-orange-400 text-sm hover:underline">
                  Create your first order
                </Link>
              </div>
            ) : (
              orders?.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.order_number || `Order #${order.id}`}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.user_name || "Client"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">KES {(order.total_price || 0).toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                      order.status === "completed" 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : order.status === "cancelled" 
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" 
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Pending Invoices</h2>
            <Link to="/invoices" className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
             {invoices?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                 <p>No pending invoices</p>
              </div>
             ) : (
              invoices?.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{invoice.invoice_number || `INV-${invoice.id}`}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        KES {(invoice.balance_due || invoice.total_amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.is_deposit_paid ? "Balance pending" : "Deposit pending"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Unassigned Orders Alert */}
      {unassigned?.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                {unassigned.length} order{unassigned.length > 1 ? "s" : ""} awaiting assignment
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Assign designers and printers to start processing orders
              </p>
            </div>
            <Link
              to="/orders"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors shadow-sm"
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