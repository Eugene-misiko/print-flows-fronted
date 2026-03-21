import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "@/store/slices/orderSlice";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (loading || !order) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  const total =
    order.items?.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    ) || 0;

  return (
    <>
    <Navbar/>
    <Sidebar/>
    <div className=" ml-67 p-8 space-y-8 mt-12 dark:text-white">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">
          ORD_{order.id.toString().padStart(3, "0")}
        </h2>
        <p className="text-gray-500">
          Order from {order.client_name}
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* CLIENT */}
        <div className="bg-white p-5 rounded-xl border dark:bg-zinc-400/10">
          <h3 className="font-semibold mb-3">Client Info</h3>
          <p className="font-bold">{order.last_name}</p>
          <p className="text-sm text-gray-500">{order.client_email}</p>
        </div>

        {/* STATUS */}
        <div className="bg-white p-5 rounded-xl border dark:bg-zinc-400/10 backdrop-blur-md">
          <h3 className="font-semibold mb-3">Order Status</h3>
          <p>Status: {order.status}</p>
          <p>Created: {new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        {/* PAYMENT */}
        <div className="bg-white p-5 rounded-xl border dark:bg-zinc-400/10">
          <h3 className="font-semibold mb-3">Payment</h3>
          <p>Total: <strong>Ksh {order.total_price}</strong></p>
        </div>

      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white border rounded-xl dark:bg-zinc-400/10">
        <h3 className="p-5 font-semibold border-b">Order Items</h3>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-400/10">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Subtotal</th>
            </tr>
          </thead>

          <tbody className="">
            {order.items?.map((item, i) => (
              <tr key={i} className="border-t ">
                <td className="p-3">{item.product_name}</td>
                <td className="p-3">Ksh {item.product_price}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">Ksh {item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default OrderDetail;