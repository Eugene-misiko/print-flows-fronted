import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logout } from "@/slices/authslice";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import backgroundImage from "../assets/backgroundImage.jpg";
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
      navigate("/home"); 
    }

  }, [token, navigate]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login")
  };


  return (
    <>
    <Navbar />
        <div className="relative h-screen bg-cover bg-center flex items-center justify-center
         bg-fixed bg-no-repeat bg-cover "  style={{ backgroundImage: `url(${backgroundImage})` }}>
     
      {!token ? (
       <div className={`relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/40 h-120 `}>
          <p className="text-cyan-500 font-bold text-center text-2xl">Login</p>
            <form onSubmit={handleLogin} className=" mt-6 p-6 ">
            <div className={`flex flex-col gap-6`}>
            <div className="">
            <Input type="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
            </div>
            <div className="">
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </div>
            <div className="flex  justify-center ">
            <Button type="submit" disabled={loading} className={`mt-10 shadow-[0_0_5px_cyan,0_0_25px_cyan] 
                    hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan,0_0_100px_cyan,0_0_200px_cyan]
                    transition-all duration-300 ease-in-out
                    px-6 py-3 bg-gray-800 text-white text-center font-semibold rounded-lg w-full `}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            </div>
            {error && <p>{error}</p>}
            </div>
            </form>
          <p className="text-center font-semibold">Don't have an account? <Link to='/register' className="text-white font-thin p-1">Register here</Link></p>
        </div>
      ) : (
        <div>
          <h3>You are logged in!</h3>
          <p>Access token: {token.slice(0, 20)}...</p>
          <Link to='/login' onClick={handleLogout} className={` w-full shadow-[0_0_5px_cyan,0_0_25px_cyan] 
                    hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan,0_0_100px_cyan,0_0_200px_cyan]
                    transition-all duration-300 ease-in-out
                    px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg`}>Logout</Link>
        </div>
      )}

      
    </div> 

    </>
  );
};

export default Login;