import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/slices/orderSlice";

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "design_completed":
      return "bg-blue-100 text-blue-700";

    case "approved":
      return "bg-emerald-100 text-emerald-700";

    case "design_rejected":
    case "print_rejected":
      return "bg-red-100 text-red-700";

    case "in_print":
      return "bg-purple-100 text-purple-700";

    case "completed":
      return "bg-emerald-600 text-white";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const ClientOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="space-y-8">

      {/* Page Title */}

      <div>
        <h2 className="text-3xl font-bold text-emerald-600">
          My Orders
        </h2>

        <p className="text-gray-500">
          Track your printing orders and their progress.
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <p className="text-gray-500">
          Loading your orders...
        </p>
      )}

      {/* Empty Orders */}

      {!loading && orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500 shadow-sm">
          You haven't placed any orders yet.
        </div>
      )}

      {/* Orders Grid */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {orders.map((order) => {
          const total =
            Number(order.product_price || 0) *
            Number(order.quantity || 0);

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition space-y-4"
            >

              {/* Header */}

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  {order.product_name}
                </h3>

                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>

              </div>

              {/* Product Image */}

              {order.product_image && (
                <img
                  src={order.product_image}
                  alt={order.product_name}
                  className="w-full h-40 object-cover rounded-lg border"
                />
              )}

              {/* Order Details */}

              <div className="space-y-1 text-sm">

                <p>
                  <span className="font-medium">
                    Quantity:
                  </span>{" "}
                  {order.quantity}
                </p>

                <p>
                  <span className="font-medium">
                    Price per unit:
                  </span>{" "}
                  Ksh {order.product_price}
                </p>

                <p className="text-lg font-semibold text-emerald-600">
                  Total: Ksh {total}
                </p>

              </div>

              {/* Rejection Reason */}

              {order.rejection_reason && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">
                    Rejection Reason:
                  </span>{" "}
                  {order.rejection_reason}
                </p>
              )}

              {/* Description */}

              {order.description && (
                <p className="text-sm text-gray-500">
                  {order.description}
                </p>
              )}

              {/* Date */}

              <p className="text-xs text-gray-400">
                Ordered on{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default ClientOrders;