import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, approveOrder, printReject } from "@/slices/orderSlice";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const PrinterDashboard = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleReject = (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      dispatch(printReject({ orderId: id, reason }));
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Printer Dashboard</h2>

      {orders.length === 0 && (
        <p className="text-muted-foreground">
          No orders ready for printing.
        </p>
      )}

      {orders.map((order) => (
        <Card key={order.id} className="shadow-md">
          <CardContent className="p-6 space-y-4">
            <div>
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Client:</strong> {order.user}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
            </div>

            {order.design_file && (
              <div>
                <p className="font-medium mb-2">Design File:</p>
                <img
                  src={order.design_file}
                  alt="Design"
                  className="w-40 h-40 object-cover rounded-md border"
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => dispatch(approveOrder(order.id))}
                className="w-full"
              >
                Approve
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleReject(order.id)}
                className="w-full"
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrinterDashboard;