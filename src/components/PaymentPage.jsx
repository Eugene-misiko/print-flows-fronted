import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initiatePayment } from "@/slices/paymentSlice";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";

const PaymentPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.payment);
  const [phone, setPhone] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      initiatePayment({
        invoice_id: id,
        phone_number: phone
      })
    );
  };

  return (
    <>
    <Navbar/>
    <Sidebar/>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 dark:text-white dark:bg-zinc-950/90 transition">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Pay Invoice #{id}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              M-Pesa Phone Number
            </label>
            <input
              type="text"
              placeholder="2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"/>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}>
            {loading ? "Processing..." : "Pay with M-Pesa"}
          </button>
        </form>
        {success && (
          <div className="mt-5 p-3 bg-green-100 text-green-700 rounded-md text-sm text-center">
            Payment request sent to your phone. Please enter your M-Pesa PIN.
          </div>
        )}
        {error && (
          <div className="mt-5 p-3 bg-red-100 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>)}
      </div>
    </div>
    </>
  );
};

export default PaymentPage;