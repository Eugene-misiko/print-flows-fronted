import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/slices/authslice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/printImg.png";
import { Label } from "./ui/label";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  useEffect(() => {
    if (token) {
      navigate("/authen");
    }
  }, [token, navigate]);

  return (
    <>
    
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}>
        
      <div className="absolute inset-0 bg-black/60" />
      
      <div
        className="relative z-10 w-full max-w-md px-10 py-10 rounded-2xl
        bg-white/20 backdrop-blur-xl
        border border-white/30
        shadow-2xl"
      >
        
        <h2 className="text-3xl font-bold text-center text-rose-600">
          Welcome Back
        </h2>
        <p className="text-center text-gray-200 text-sm mt-2">
          Login to manage your printing orders
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold text-white">Username</Label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-white/70 border-none focus-visible:ring-2 focus-visible:ring-rose-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-white">Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/70 border-none focus-visible:ring-2 focus-visible:ring-rose-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600/70 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>
        <p className="text-center mt-6 text-sm text-gray-200">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-rose-400 hover:text-rose-500 font-medium"
          >
            Register here
          </Link>
        </p>
      <Link to='/' className="absolute mt-15 bg-rose-600/60 text-white hover:bg-rose-700 px-8 py-3 rounded-lg cursor-pointer text-lg font-semibold transition">
      Learn More ↶
      </Link>

      </div>

    </div>
    
    </>
  );
};

export default Login;