import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestPasswordReset } from "@/store/slices/authslice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import backgroundImage from "../assets/printImg.png";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { passwordLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(requestPasswordReset({ email }))
      .unwrap()
      .then(() => {
        toast.success("Reset link sent! Check your email.");
      })
      .catch((err) => {
        toast.error(err || "Failed to send reset link");
      });
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md px-10 py-10 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-emerald-600">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-200 text-sm mt-2 mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/70 outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
          >
            {passwordLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-emerald-300 hover:text-emerald-200 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;