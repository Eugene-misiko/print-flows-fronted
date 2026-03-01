import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  approveOrder,
  rejectOrder,
  assignDesigner,
} from "@/slices/orderSlice";

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

  if (loading) return <p>Loading orders...</p>;

  return (
    <div>
      <h2>Admin Order Management</h2>

      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>User:</strong> {order.user}</p>

          <button onClick={() => dispatch(approveOrder(order.id))}>
            Approve
          </button>

          <button onClick={() => handleReject(order.id)}>
            Reject
          </button>

          <button onClick={() => handleAssign(order.id)}>
            Assign Designer
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;