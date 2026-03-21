import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/store/slices/orderSlice";
import { useNavigate } from "react-router-dom";

const steps = ["pending_design", "design_completed", "approved", "printing", "completed"];

const getStepIndex = (status) => steps.indexOf(status);

const getStatusColor = (status) => {
  switch (status) {
    case "pending_design":
      return "bg-yellow-500/10 text-yellow-600";
    case "design_completed":
      return "bg-blue-500/10 text-blue-600";
    case "approved":
      return "bg-emerald-500/10 text-emerald-600";
    case "printing":
      return "bg-purple-500/10 text-purple-600";
    case "completed":
      return "bg-emerald-600 text-white";
    case "design_rejected":
    case "print_rejected":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-gray-200 text-gray-600";
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
    <div className="space-y-8 px-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-emerald-600">
            My Orders
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Track your printing orders
          </p>
        </div>
        <button
          onClick={() => navigate("/create-order")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl transition"
        >
          + New Order
        </button>
      </div>
      {/* LOADING */}
      {loading && (
        <p className="text-gray-500">Loading orders...</p>
      )}
      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <div className="p-10 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">
          No orders yet
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => {
          const total =
            order.items?.reduce(
              (sum, item) => sum + Number(item.subtotal || 0),
              0
            ) || 0;

          const currentStep = getStepIndex(order.status);
          return (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition space-y-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-lg font-semibold text-emerald-600 cursor-pointer hover:underline"
                  >
                    ORD_{order.id.toString().padStart(3, "0")}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items?.[0]?.product_name || "Custom Product"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor(order.status)}`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                  <div key={step} className="flex-1 text-center">
                    <div
                      className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
                        index <= currentStep
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-300 dark:bg-zinc-700 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <p className="text-[10px] mt-1 capitalize text-gray-500 dark:text-gray-400">
                      {step.replace("_", " ")}
                    </p>
                  </div>
                ))}
              </div>

              {/* DETAILS */}
              <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <p><strong>Items:</strong> {order.items?.length || 0}</p>
                <p>
                  <strong>Total:</strong>{" "}
                  <span className="text-emerald-600 font-semibold">
                    Ksh {total}
                  </span>
                </p>
              </div>

              {/* DATE */}
              <p className="text-xs text-gray-400">
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