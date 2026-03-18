import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  printApprove,
  printReject,
  startPrinting,
  completePrint,
} from "@/slices/orderSlice";
import { toast } from "react-toastify";

const getStatusColor = (status) => {
  switch (status) {
    case "design_completed":
      return "bg-blue-100 text-blue-700";
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "printing":
      return "bg-purple-100 text-purple-700";
    case "completed":
      return "bg-emerald-600 text-white";
    case "print_rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [reasons, setReasons] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const printerOrders = orders.filter((order) =>
    ["design_completed", "approved", "printing"].includes(order.status)
  );

  const handleReject = (orderId) => {
    const reason = reasons[orderId];

    if (!reason) return toast.error("Enter rejection reason");

    dispatch(printReject({ orderId, reason }));
    toast.success("Order rejected");

    setReasons((prev) => ({ ...prev, [orderId]: "" }));
  };

  if (loading) {
    return <p className="p-8 text-gray-500">Loading printer orders...</p>;
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-emerald-600">
          Printer Dashboard
        </h2>
        <p className="text-gray-500">
          Manage print-ready orders
        </p>
      </div>

      {/* EMPTY */}
      {printerOrders.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No orders ready for printing.
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {printerOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border rounded-xl p-5 shadow-sm space-y-4"
          >

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-emerald-600">
                ORD_{order.id.toString().padStart(3, "0")}
              </h3>

              <span
                className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.replaceAll("_", " ")}
              </span>
            </div>

            {/* INFO */}
            <div className="text-sm space-y-1">
              <p><strong>Product:</strong> {order.product_name}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
            </div>

            {/* DESIGN */}
            {order.design_file && (
              <img
                src={order.design_file}
                className="w-full h-40 object-cover rounded-lg border"
              />
            )}

            {/* REASON INPUT */}
            <input
              value={reasons[order.id] || ""}
              onChange={(e) =>
                setReasons({ ...reasons, [order.id]: e.target.value })
              }
              placeholder="Rejection reason..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2">

              {order.status === "design_completed" && (
                <button
                  onClick={() => {
                    dispatch(printApprove(order.id));
                    toast.success("Approved for printing");
                  }}
                  className="bg-emerald-600 text-white px-3 py-2 rounded-lg"
                >
                  Approve
                </button>
              )}

              {order.status === "approved" && (
                <button
                  onClick={() => {
                    dispatch(startPrinting(order.id));
                    toast.success("Printing started");
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                >
                  Start
                </button>
              )}

              {order.status === "printing" && (
                <button
                  onClick={() => {
                    dispatch(completePrint(order.id));
                    toast.success("Order completed");
                  }}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleReject(order.id)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg">
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