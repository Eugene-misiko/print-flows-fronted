import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  designReject,
  designComplete,
} from "@/store/slices/orderSlice";
import { toast } from "react-toastify";

export default function DesignerDashboard() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const designOrders = orders.filter(
    (order) =>
      order.needs_design &&
      ["pending_design", "design_rejected"].includes(order.status)
  );

  const handleApprove = () => {
    dispatch(designComplete(selectedOrder.id)).then(()=>{
      dispatch(fetchOrders());
    });
    toast.success("Design approved");
    setSelectedOrder(null);
  };

  const handleReject = () => {
    if (!reason) return toast.error("Enter rejection reason");

    dispatch(designReject({ orderId: selectedOrder.id, reason })).then(()=>{
      dispatch(fetchOrders());
    });
    toast.success("Design rejected");

    setRejectModal(false);
    setReason("");
    setSelectedOrder(null);
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading design requests...</p>;
  }
  {!selectedOrder ? (
    <p className="text-gray-400">
      Select an order to view details
    </p>
  ) : (
    (() => {
      const item = selectedOrder?.items?.[0];

      return (
        <div className="space-y-6">
          ...
        </div>
      );
    })()
  )}
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-zinc-900">
      <div className="w-1/3 border-r dark:border-zinc-700 overflow-y-auto">
        <div className="p-4 text-lg font-semibold dark:text-white">
          Design Queue
        </div>
        
        {designOrders.map((order) => (
          <div key={order.id}
            onClick={() => setSelectedOrder(order)}
            className={`p-4 cursor-pointer border-b dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 ${
              selectedOrder?.id === order.id
                ? "bg-gray-100 dark:bg-zinc-800"
                : ""}`}>
            <p className="font-semibold dark:text-white">
              ORD_{order.id.toString().padStart(3, "0")}
            </p>
            <p className="text-sm text-gray-500">
              {order.items?.[0]?.product_name || order.custom_product_name || "Custom Product"}
            </p>
          </div>
        ))}
        {designOrders.length === 0 && (
          <p className="p-4 text-gray-500">No design work available</p>
        )}
      </div>
      {/* RIGHT PANEL */}
      <div className="flex-1 p-6">
        {!selectedOrder ? (
          <p className="text-gray-400">
            Select an order to view details
          </p>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">
              Order Details
            </h2>
            <p className="text-sm text-gray-400">
              Order ID: ORD_{selectedOrder.id.toString().padStart(3, "0")}
            </p>            
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <strong>Product:</strong>{" "}
            {selectedOrder?.items?.[0]?.product_name ||
            selectedOrder?.custom_product_name ||
            "Custom Product"} <br />

            <strong>Quantity:</strong>{" "}
            {selectedOrder?.items?.[0]?.quantity || 0}

            {selectedOrder.design_file && (
              <img
                src={selectedOrder.design_file}
                className="w-full h-48 object-cover rounded-lg border dark:border-zinc-700"
              />
            )} 
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Notes:</strong>{" "}
                {selectedOrder.description || "None"}
              </p>
            </div>
            {/* ACTIONS */}
            <div className="flex gap-4">
              <button
                onClick={() => setRejectModal(true)}
                className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition">
                Approve →
              </button>
            </div>
          </div>
        )}
      </div>
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-[400px] space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold dark:text-white">
              Reject Order
            </h3>

            <textarea
              placeholder="Describe the issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}