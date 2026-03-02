import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  approveOrder,
  rejectOrder,
  assignDesigner,
  fetchDesigners,
} from "@/slices/orderSlice";

import { Card, CardContent } from "./ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, designers, loading } = useSelector((state) => state.orders);

  const [rejectionReasons, setRejectionReasons] = useState({});
  const [selectedDesigners, setSelectedDesigners] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchDesigners());
  }, [dispatch]);

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Admin Order Management</h2>

      {orders.map((order) => (
        <Card key={order.id} className="shadow-md">
          <CardContent className="p-6 space-y-4">

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {order.status}
                </p>
                <p className="text-sm">User: {order.user}</p>
              </div>

              {order.design_file && (
                <img
                  src={order.design_file}
                  alt="Design"
                  className="w-24 h-24 object-cover rounded-md border"
                />
              )}
            </div>

            
            <div className="flex flex-wrap gap-3">

              <Button
                onClick={() => dispatch(approveOrder(order.id))}
              >
                Approve
              </Button>

              
              <div className="flex flex-col gap-2 w-full max-w-sm">
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReasons[order.id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({
                      ...rejectionReasons,
                      [order.id]: e.target.value,
                    })
                  }
                />

                <Button
                  className={`bg-zinc-700`}
                  onClick={() =>
                    dispatch(
                      rejectOrder({
                        orderId: order.id,
                        reason: rejectionReasons[order.id],
                      })
                    )
                  }
                >
                  Reject
                </Button>
              </div>

              
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(value) =>
                    setSelectedDesigners({
                      ...selectedDesigners,
                      [order.id]: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Designer" />
                  </SelectTrigger>
                  <SelectContent>
                    {designers.map((designer) => (
                      <SelectItem
                        key={designer.id}
                        value={designer.id.toString()}
                      >
                        {designer.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() =>
                    dispatch(
                      assignDesigner({
                        orderId: order.id,
                        designerId: selectedDesigners[order.id],
                      })
                    )
                  }
                >
                  Assign
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminOrders;