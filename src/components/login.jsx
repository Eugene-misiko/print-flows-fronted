import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/slices/authslice";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/printImg.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, token } = useSelector((state) => state.auth);

  const [first_name, setFirstName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ first_name, password }));
  };

  useEffect(() => {
    if (token) {
      navigate("/authen");
    }
  }, [token, navigate]);

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

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="font-semibold text-white">
              First Name
            </label>

            <input
              type="text"
              placeholder="Enter your first name"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="
              w-full px-4 py-2
              rounded-lg
              bg-white/70
              outline-none
              focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-white">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
              w-full px-4 py-2
              rounded-lg
              bg-white/70
              outline-none
              focus:ring-2 focus:ring-emerald-500"
            />
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
            py-2
            rounded-lg
            transition
            cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}
        </form>

        <p className="text-center mt-6 text-sm text-gray-200">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-400 hover:text-emerald-500 font-medium"
          >
            Register here
          </Link>
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="
            bg-emerald-600/80
            hover:bg-emerald-700
            text-white
            px-6 py-2
            rounded-lg
            text-sm
            font-semibold
            transition"
          >
            ← Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;