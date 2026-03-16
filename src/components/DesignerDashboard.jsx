import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  designReject,
  designComplete,
} from "@/slices/orderSlice";

export default function DesignerDashboard() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [reasons, setReasons] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const designOrders = orders.filter(
    (order) =>
      order.needs_design === true &&
      (order.status === "pending_design" ||
        order.status === "design_rejected")
  );

  const handleReject = (orderId) => {
    const reason = reasons[orderId];

    if (!reason) {
      return alert("Please enter rejection reason");
    }

    dispatch(designReject({ orderId, reason }));

    setReasons((prev) => ({
      ...prev,
      [orderId]: "",
    }));
  };

  if (loading) {
    return (
      <p className="ml-15 mt-24 p-6 text-zinc-500 dark:text-zinc-400">
        Loading design requests...
      </p>
    );
  }

  return (
    <div className="ml-15 mt-24 p-8 space-y-8">

      <h1 className="text-3xl font-bold text-emerald-600">
        Designer Dashboard
      </h1>

      {designOrders.length === 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
          No design requests available.
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {designOrders.map((order) => (
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
          ">
            <div className="flex justify-between items-center">

              <h3 className="text-lg font-semibold">
                Order #{order.id}
              </h3>

              <span
                className="
                text-xs
                bg-zinc-200 dark:bg-zinc-800
                px-2 py-1
                rounded-md
                capitalize">
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">
                  Product:
                </span>{" "}
                {order.product_name}
              </p>
              <p>
                <span className="font-medium">
                  Quantity:
                </span>{" "}
                {order.quantity}
              </p>
            </div>
            {order.design_file && (
              <img
                src={order.design_file}
                alt="Client Design"
                className="w-full h-44 object-cover rounded-lg border"
              />
            )}
            {order.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {order.description}
              </p>
            )}
            <textarea
              value={reasons[order.id] || ""}
              onChange={(e) =>
                setReasons({
                  ...reasons,
                  [order.id]: e.target.value,
                })}
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
              "/>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  dispatch(designComplete(order.id))}
                className="
                flex-1
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                py-2
                rounded-lg
                font-medium
                transition
                ">
                Complete Design
              </button>
              <button
                onClick={() => handleReject(order.id)}
                className="
                flex-1
                bg-red-600
                hover:bg-red-700
                text-white
                py-2
                rounded-lg
                font-medium
                transition
                ">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}