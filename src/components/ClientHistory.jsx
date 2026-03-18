import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/slices/orderSlice";
import { useNavigate } from "react-router-dom";

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "design_completed":
      return "bg-blue-100 text-blue-700";
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "printing":
      return "bg-purple-100 text-purple-700";
    case "completed":
      return "bg-emerald-600 text-white";
    case "design_rejected":
    case "print_rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const ClientOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders = [], loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-emerald-600">
            My Orders
          </h2>
          <p className="text-gray-500">
            Track your printing orders
          </p>
        </div>

        <button
          onClick={() => navigate("/create-order")}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg"
        >
          + New Order
        </button>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <div className="p-10 text-center text-gray-500 bg-white rounded-xl">
          No orders yet
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
        {orders.map((order) => {
          const total =
            order.items?.reduce(
              (sum, item) => sum + Number(item.subtotal || 0),
              0
            ) || 0;

          const quantity =
            order.items?.reduce(
              (sum, item) => sum + Number(item.quantity || 0),
              0
            ) || 0;

          return (
            <div
              key={order.id}
              className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md space-y-4 bg-zinc-400/10"
            >
              {/* HEADER */}
              <div className="flex justify-between ">
                <div>
                  <h3
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-lg font-semibold text-emerald-600 cursor-pointer hover:underline"
                  >
                    ORD_{order.id.toString().padStart(3, "0")}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {order.items?.[0]?.product_name || "No item"}
                  </p>
                </div>

                <span className={`px-3 dark:text-white dark:bg-zinc-400/10 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* DETAILS */}
              <div className="text-sm space-y-1">
                <p><strong>Items:</strong> {order.items?.length || 0}</p>
                <p><strong>Quantity:</strong> {quantity}</p>
                <p className="text-lg font-semibold text-emerald-600">
                  Total: Ksh {total}
                </p>
              </div>

              {/* DATE */}
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientOrders;