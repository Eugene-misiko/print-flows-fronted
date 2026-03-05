import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  designReject,
  designComplete,
} from "@/slices/orderSlice";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function DesignerDashboard() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [reasons, setReasons] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

 // Only show orders that need design
  const designOrders = orders.filter(
    (order) =>
      order.needs_design === true &&
      (order.status === "pending_design" ||
        order.status === "design_rejected")
  );
  // const designOrders = orders

  const handleReject = (orderId) => {
    const reason = reasons[orderId];
    if (!reason) return alert("Please enter rejection reason");

    dispatch(designReject({ orderId, reason }));
    setReasons((prev) => ({ ...prev, [orderId]: "" }));
  };

  if (loading) return <p className="p-6">Loading design requests...</p>;
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight ml-58">
        Designer Dashboard
      </h1>

      {designOrders.length === 0 && (
        <p className="text-muted-foreground ml-58">
          No design requests available.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ml-58">
        {designOrders.map((order) => (
          <Card
            key={order.id}
            className="rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Order #{order.id}
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>Product:</strong> {order.product_name}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
              </div>
              {order.design_file && (
                <img
                  src={order.design_file}
                  alt="Client Design"
                  className="w-full h-44 object-cover rounded-xl border"
                />
              )}

              {order.description && (
                <p className="text-sm text-muted-foreground">
                  {order.description}
                </p>
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
                className="border rounded-lg p-2 w-full text-sm focus:ring-2 focus:ring-red-400 outline-none"/>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => dispatch(designComplete(order.id))}
                  className=" bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Complete Design
                </Button>

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
}