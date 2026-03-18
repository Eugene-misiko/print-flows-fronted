import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  designReject,
  designComplete,
} from "@/slices/orderSlice";
import { toast } from "react-toastify";

export default function DesignerDashboard() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [reasons, setReasons] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const designOrders = orders.filter((order) =>
    ["pending", "design_rejected"].includes(order.status)
  );

  const handleReject = (orderId) => {
    const reason = reasons[orderId];

    if (!reason) return toast.error("Enter rejection reason");

    dispatch(designReject({ orderId, reason }));
    toast.success("Design rejected");

    setReasons((prev) => ({ ...prev, [orderId]: "" }));
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading design requests...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-emerald-600">
          Designer Dashboard
        </h1>
        <p className="text-gray-500">
          Handle design requests
        </p>
      </div>

      {designOrders.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No design requests available.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {designOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border rounded-xl p-5 shadow-sm space-y-4"
          >

            <div className="flex justify-between">
              <h3 className="font-semibold text-emerald-600">
                ORD_{order.id.toString().padStart(3, "0")}
              </h3>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {order.status.replaceAll("_", " ")}
              </span>
            </div>

            <div className="text-sm space-y-1">
              <p><strong>Product:</strong> {order.product_name}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
            </div>

            {order.description && (
              <p className="text-sm text-gray-500">
                {order.description}
              </p>
            )}

            <input
              value={reasons[order.id] || ""}
              onChange={(e) =>
                setReasons({ ...reasons, [order.id]: e.target.value })
              }
              placeholder="Rejection reason..."
              className="w-full border rounded-lg px-3 py-2 text-sm"/>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  dispatch(designComplete(order.id));
                  toast.success("Design completed");
                }}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg"
              >
                Complete
              </button>

              <button
                onClick={() => handleReject(order.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg">
                Reject
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}