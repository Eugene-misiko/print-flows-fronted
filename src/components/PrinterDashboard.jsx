import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  printApprove,
  printReject,
  startPrinting,
  completePrint,
} from "@/slices/orderSlice";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

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

  if (loading)
    return (
      <p className="ml-64 p-8 text-zinc-500 dark:text-zinc-400">
        Loading printer orders...
      </p>
    );

  return (
    <div className="ml-64 p-8 space-y-8 min-h-screen  dark:bg-zinc-900 transition-colors">

      <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
        Printer Dashboard
      </h2>

      {printerOrders.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          No orders available for printing.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {printerOrders.map((order) => (
          <Card
            key={order.id}
            className="rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-[2px] transition"
          >
            <CardContent className="p-6 space-y-4">

              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Order #{order.id}
                </h3>

                <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-700 capitalize">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

             
              <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                <p>
                  <strong>Product:</strong> {order.product_name}
                </p>
                <p>
                  <strong>Quantity:</strong> {order.quantity}
                </p>
              </div>

             
              {order.design_file && (
                <img
                  src={order.design_file}
                  alt="Design"
                  className="w-full h-44 object-cover rounded-xl border"
                />
              )}

              
              <textarea
                value={reasons[order.id] || ""}
                onChange={(e) =>
                  setReasons({
                    ...reasons,
                    [order.id]: e.target.value,
                  })
                }
                placeholder="Enter rejection reason"
                className="border rounded-lg p-2 w-full text-sm 
                           focus:ring-2 focus:ring-rose-400 outline-none
                           dark:bg-zinc-900 dark:border-zinc-700"
              />
              <div className="flex flex-wrap gap-3 pt-2">

                {order.status === "design_completed" && (
                  <Button
                    onClick={() => dispatch(printApprove(order.id))}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Approve
                  </Button>
                )}

                {order.status === "approved" && (
                  <Button
                    onClick={() => dispatch(startPrinting(order.id))}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Printing
                  </Button>
                )}

                {order.status === "printing" && (
                  <Button
                    onClick={() => dispatch(completePrint(order.id))}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Complete
                  </Button>
                )}
                <Button
                  onClick={() => handleReject(order.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>

              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrinterDashboard;