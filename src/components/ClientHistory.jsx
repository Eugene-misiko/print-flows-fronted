import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/slices/orderSlice";

const ClientOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#999";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "in_design":
        return "orange";
      case "completed":
        return "blue";
      default:
        return "black";
    }
  };

  if (loading) return <p>Loading your orders...</p>;

  return (
    <div>
      <h2>My Orders</h2>

      {orders.length === 0 && <p>You have no orders yet.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <p><strong>Product:</strong> {order.product_name || order.product}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: getStatusColor(order.status) }}>
              {order.status}
            </span>
          </p>

          {order.status === "rejected" && (
            <p style={{ color: "red" }}>
              <strong>Reason:</strong> {order.rejection_reason}
            </p>
          )}

          <p>
            <small>
              Ordered on: {new Date(order.created_at).toLocaleString()}
            </small>
          </p>
        </div>
      ))}
    </div>
  );
};

export default ClientOrders;