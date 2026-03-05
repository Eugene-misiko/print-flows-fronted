import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser} from "@/slices/authslice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/printImg.png";
import { Label } from "./ui/label";

const Login = () => {
  const navigate = useNavigate()
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
  <div
    className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
   
    <div className="absolute inset-0 bg-black/60" />

   
    <div className="relative z-10 w-full max-w-md px-8 py-10 rounded-2xl 
        bg-white/20 dark:bg-zinc-900/40 
        backdrop-blur-2xl 
        border border-white/30 dark:border-zinc-700
        shadow-2xl shadow-black/50"
    >
      <h2 className="text-3xl font-bold text-center text-cyan-500">
        Login
      </h2>

      <form onSubmit={handleLogin} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label className="font-semibold">Username</Label>
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-white/50 dark:bg-zinc-800/70 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Password</Label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/50 dark:bg-zinc-800/70 backdrop-blur-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-4 shadow-[0_0_5px_cyan,0_0_25px_cyan] 
          hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan,0_0_100px_cyan] 
          transition-all duration-300 ease-in-out 
          bg-gray-800 text-white font-semibold rounded-lg w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </form>

      <p className="text-center mt-6 text-sm">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-white font-light hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  </div>
);
};

export default Login;