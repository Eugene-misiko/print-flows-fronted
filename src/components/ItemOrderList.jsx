import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemOrders } from "@/slices/itemSlice";

const ItemOrderList = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.items);

  useEffect(() => {
    dispatch(fetchItemOrders());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order.id}>
          <h4>{order.title}</h4>
          <p>Type: {order.product_type}</p>
          <p>Status: {order.status}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ItemOrderList;