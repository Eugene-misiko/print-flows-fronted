import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/slices/authslice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage from "../assets/printImg.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (token) {
      toast.success("Login Successful!");
      navigate("/authen");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div
        className="
        relative z-10
        w-full max-w-md
        px-10 py-10
        rounded-2xl
        bg-white/20 backdrop-blur-xl
        border border-white/30
        shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center text-emerald-600">
          Welcome Back
        </h2>

        <p className="text-center text-gray-200 text-sm mt-2">
          Login to manage your printing orders
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="font-semibold text-white text-sm">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
              w-full px-4 py-3
              rounded-lg
              bg-white/70
              outline-none
              focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-white text-sm">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
              w-full px-4 py-3
              rounded-lg
              bg-white/70
              outline-none
              focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm text-emerald-300 hover:text-emerald-200 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
            w-full
            bg-emerald-600
            hover:bg-emerald-700
            text-white
            font-semibold
            py-3
            rounded-lg
            transition
            shadow-lg
            disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-200">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-400 hover:text-emerald-500 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;