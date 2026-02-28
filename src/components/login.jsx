import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser} from "@/slices/authslice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/printImg.png";

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
      navigate("/"); 
    }
  }, [token, navigate]);

  return (
    <div
      className="relative h-screen bg-cover bg-center flex items-center justify-center bg-fixed bg-no-repeat bg-cover "
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div class="absolute inset-0 bg-black opacity-40">
     </div>
     <div className="absolute inset-0 flex items-center justify-center backdrop-blur-0">
     </div>
        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/40 h-120">
          <p className="text-cyan-500 font-bold text-center text-2xl">Login</p>
          <form onSubmit={handleLogin} className="mt-6 p-6">
            <div className="flex flex-col gap-6">
              <Input
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="mt-10 shadow-[0_0_5px_cyan,0_0_25px_cyan] 
                    hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan,0_0_100px_cyan,0_0_200px_cyan]
                    transition-all duration-300 ease-in-out
                    px-6 py-3 bg-gray-800 text-white text-center font-semibold rounded-lg w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              {error && <p>{error}</p>}
            </div>
          </form>
          <p className="text-center font-semibold">
            Don't have an account?{" "}
            <Link to='/register' className="text-white font-thin p-1">Register here</Link>
          </p>
        </div>
    </div>
  );
};

export default Login;