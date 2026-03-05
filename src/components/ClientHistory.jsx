import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/slices/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

const getStatusVariant = (status) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "design_completed":
      return "outline";
    case "approved":
      return "default";
    case "design_rejected":
      
    case "print_rejected":
      return "destructive";
    case "in_print":
      return "outline";
    case "completed":
      return "default";
    default:
      return "secondary";
  }
};

const ClientOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">
        My Orders
      </h2>

      {loading && (
        <p className="text-muted-foreground">
          Loading your orders...
        </p>
      )}

      {!loading && orders.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You haven't placed any orders yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 ml-58">
        {orders.map((order) => {
          const total =
            Number(order.product_price || 0) *
            Number(order.quantity || 0);

          return (
            <Card
              key={order.id}
              className="rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {order.product_name}
                </CardTitle>

                <Badge variant={getStatusVariant(order.status)}>
                  {order.status.replaceAll("_", " ")}
                </Badge>
              </CardHeader>

              <Separator />

              <CardContent className="pt-4 space-y-3">
                {order.product_image && (
                  <img
                    src={order.product_image}
                    alt={order.product_name}
                    className="w-full h-40 object-cover rounded-lg border "
                  />
                )}

                <p>
                  <span className="font-medium">Quantity:</span>{" "}
                  {order.quantity}
                </p>
                <p>
                  <span className="font-medium">Price per unit:</span>{" "}
                  ksh {order.product_price}
                </p>

                <p className="text-lg font-semibold">
                  Total: Ksh {total}
                </p>
                {order.rejection_reason && (
                  <p className="text-red-500 text-sm">
                    <span className="font-medium">
                      Rejection Reason:
                    </span>{" "}
                    {order.rejection_reason}
                  </p>
                )}
               <p>{order.description}</p>
                <p className="text-sm text-muted-foreground">
                  Ordered on{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>

              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ClientOrders;