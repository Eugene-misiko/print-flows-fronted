import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  printApprove,
  printReject,
  startPrinting,
  completePrint,
} from "@/slices/orderSlice";

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [reasons, setReasons] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const printerOrders = orders.filter(
    (order) =>
      order.status === "design_completed" ||
      order.status === "approved" ||
      order.status === "printing" ||
      order.status === "print_rejected"
  );

  const handleReject = (orderId) => {
    const reason = reasons[orderId];
    if (!reason) return alert("Please enter rejection reason");

    dispatch(printReject({ orderId, reason }));
    setReasons((prev) => ({ ...prev, [orderId]: "" }));
  };

  if (loading) {
    return (
      <p className="ml-64 p-8 text-zinc-500 dark:text-zinc-400">
        Loading printer orders...
      </p>
    );
  }

  return (
    <div className="ml-64 p-8 space-y-8 min-h-screen dark:bg-zinc-900 transition-colors">

      <h2 className="text-3xl font-bold text-emerald-600">
        Printer Dashboard
      </h2>

      {printerOrders.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          No orders available for printing.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {printerOrders.map((order) => (
          <div
            key={order.id}
            className="
            rounded-xl
            border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900
            shadow-sm
            hover:shadow-lg
            transition
            p-6
            space-y-4
          "
          >

            {/* Header */}

            <div className="flex justify-between items-center">

              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Order #{order.id}
              </h3>

              <span
                className="
                text-xs
                px-3 py-1
                rounded-md
                bg-zinc-200 dark:bg-zinc-800
                capitalize
                "
              >
                {order.status.replaceAll("_", " ")}
              </span>

            </div>

            {/* Order Info */}

            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              <p>
                <strong>Product:</strong> {order.product_name}
              </p>
              <p>
                <strong>Quantity:</strong> {order.quantity}
              </p>
            </div>

            {/* Design Preview */}

            {order.design_file && (
              <img
                src={order.design_file}
                alt="Design"
                className="w-full h-44 object-cover rounded-lg border"
              />
            )}

            {/* Reject Reason */}

            <textarea
              value={reasons[order.id] || ""}
              onChange={(e) =>
                setReasons({
                  ...reasons,
                  [order.id]: e.target.value,
                })
              }
              placeholder="Enter rejection reason"
              className="
              border border-zinc-300 dark:border-zinc-700
              rounded-lg
              p-2
              w-full
              text-sm
              bg-white dark:bg-zinc-900
              focus:ring-2 focus:ring-emerald-500
              outline-none
              "
            />

            {/* Buttons */}

            <div className="flex flex-wrap gap-3 pt-2">

              {order.status === "design_completed" && (
                <button
                  onClick={() => dispatch(printApprove(order.id))}
                  className="
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  px-4 py-2
                  rounded-lg
                  font-medium
                  transition
                  "
                >
                  Approve
                </button>
              )}

              {order.status === "approved" && (
                <button
                  onClick={() => dispatch(startPrinting(order.id))}
                  className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-4 py-2
                  rounded-lg
                  font-medium
                  transition
                  "
                >
                  Start Printing
                </button>
              )}

              {order.status === "printing" && (
                <button
                  onClick={() => dispatch(completePrint(order.id))}
                  className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-white
                  px-4 py-2
                  rounded-lg
                  font-medium
                  transition
                  "
                >
                  Complete
                </button>
              )}

              <button
                onClick={() => handleReject(order.id)}
                className="
                bg-red-600
                hover:bg-red-700
                text-white
                px-4 py-2
                rounded-lg
                font-medium
                transition
                "
              >
                Reject
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default PrinterDashboard;