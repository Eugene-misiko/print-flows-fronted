import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  printApprove,
  printReject,
  startPrinting,
  completePrint,
} from "@/store/slices/orderSlice";
import { toast } from "react-toastify";

const steps = ["design_completed", "approved", "printing", "completed"];

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const printerOrders = orders.filter((order) =>
    ["design_completed", "approved", "printing"].includes(order.status)
  );

  const handleReject = () => {
    if (!reason) return toast.error("Enter rejection reason");

    dispatch(printReject({ orderId: selectedOrder.id, reason }));
    toast.success("Order rejected");

    setReason("");
    setShowReject(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return <p className="p-8 text-gray-500">Loading printer orders...</p>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* LEFT PANEL */}
      <div className="w-1/2 border-r dark:border-zinc-800 overflow-y-auto">

        <div className="p-4">
          <h2 className="text-xl font-bold text-emerald-600">
            Print Queue
          </h2>
        </div>
        {printerOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className={`p-4 cursor-pointer border-b dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition ${
              selectedOrder?.id === order.id
                ? "bg-gray-100 dark:bg-zinc-800"
                : ""
            }`}
          >
            <p className="font-semibold">
              {order.product_name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Qty: {order.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 p-6 space-y-6">

        {!selectedOrder ? (
          <p className="text-gray-500">Select an order</p>
        ) : (
          <>
            {/* TITLE */}
            <div>
              <h2 className="text-2xl font-bold">
                {selectedOrder.product_name}
              </h2>
              <p className="text-gray-500">
                Order #{selectedOrder.id}
              </p>
            </div>
            {/* STEPS */}
            <div className="flex justify-between">
              {steps.map((step, i) => {
                const currentStep = steps.indexOf(selectedOrder.status);
                const active = currentStep >= i;

                return (
                  <div key={step} className="flex-1 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                        active
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-300 dark:bg-zinc-700"
                      }`}>
                      {i + 1}
                    </div>
                    <p className="text-xs mt-1 capitalize">{step}</p>
                  </div>
                );
              })}
            </div>
            {printerOrders.length === 0 && (
            <p className="p-4 text-gray-500">No print jobs yet</p>
              )}
            {/* IMAGE */}
            {selectedOrder.design_file && (
              <img
                src={selectedOrder.design_file}
                className="w-full h-48 object-cover rounded-lg border dark:border-zinc-700"
              />
            )}

            {/* DETAILS */}
            <div className="space-y-2 text-sm">
              <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">

              {selectedOrder.status === "design_completed" && (
                <button
                  onClick={() => {
                    dispatch(printApprove(selectedOrder.id)).then(() => {
                      dispatch(fetchOrders());
                    });
                    toast.success("Approved");
                  }}
                  className="bg-yellow-500 px-4 py-2 rounded-lg text-black">
                  Approve
                </button>
              )}
              {selectedOrder.status === "approved" && (
                <button
                  onClick={() => {
                    dispatch(startPrinting(selectedOrder.id));
                    toast.success("Printing started");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Start Printing
                </button>
              )}
              {selectedOrder.status === "printing" && (
                <button
                  onClick={() => {
                    dispatch(completePrint(selectedOrder.id));
                    toast.success("Completed");
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                  Complete
                </button>
              )}

              <button
                onClick={() => setShowReject(true)}
                className="border px-4 py-2 rounded-lg text-red-500"
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
      {showReject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-[400px] space-y-4">

            <h3 className="text-lg font-bold">Reject Order</h3>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full border dark:border-zinc-700 rounded-lg p-3 bg-gray-50 dark:bg-zinc-800"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReject(false)}>
                Cancel
              </button>

              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterDashboard;