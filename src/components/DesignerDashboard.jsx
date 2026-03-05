import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  designReject,
  designComplete,
} from "@/slices/orderSlice";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
export default function DesignerDashboard() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [reasons, setReasons] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Filter only orders that need design
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
      <p className="ml-56 mt-24 p-6 text-muted-foreground">
        Loading design requests...
      </p>
    );
  }

  return (
    <div className="ml-56 mt-24 p-8 space-y-8">
      <h1 className="text-3xl font-bold text-rose-600">
        Designer Dashboard
      </h1>
      {designOrders.length === 0 && (
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="py-10 text-center text-muted-foreground">
            No design requests available.
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {designOrders.map((order) => (
          <Card
            key={order.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Order #{order.id}
                </h3>

                <Badge variant="secondary">
                  {order.status.replaceAll("_", " ")}
                </Badge>

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
                className="border border-zinc-300 dark:border-zinc-700 
                rounded-lg p-2 w-full text-sm
                bg-white dark:bg-zinc-900
                focus:ring-2 focus:ring-rose-500 outline-none"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() =>
                    dispatch(designComplete(order.id))
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white flex-1"
                >
                  Complete Design
                </Button>

                <Button
                  onClick={() => handleReject(order.id)}
                  variant="destructive"
                  className="flex-1"
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