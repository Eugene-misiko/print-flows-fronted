import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  approveOrder,
  rejectOrder,
  assignDesigner,
} from "@/slices/orderSlice";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleReject = (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      dispatch(rejectOrder({ orderId: id, reason }));
    }
  };

  const handleAssign = (id) => {
    const designerId = prompt("Enter Designer ID:");
    if (designerId) {
      dispatch(assignDesigner({ orderId: id, designerId }));
    }
  };
  if (loading)
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading orders...
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Admin Order Management
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="shadow-sm hover:shadow-md transition rounded-2xl"
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Order #{order.id}</span>

                <Badge variant="outline" className="capitalize">
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">User:</span> {order.user}
                </p>
              </div>

              
              {order.design_file && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Design:</p>
                  <img
                    src={order.design_file}
                    alt="Client Design"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-3">
                <Button
                  size="sm"
                  onClick={() => dispatch(approveOrder(order.id))}
                  disabled={order.status !== "pending"}
                >
                  Approve
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(order.id)}
                  disabled={order.status !== "pending"}
                >
                  Reject
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAssign(order.id)}
                >
                  Assign Designer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;