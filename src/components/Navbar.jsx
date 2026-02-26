import Register from "./registration";
import Login from "./login";
import React from 'react'
import { logout } from "@/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {token} = useSelector((state)=> state.auth);

      const handleLogout = () => {
    dispatch(logout());       
    navigate("/login");      
  };
  return (
    <>
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="font-bold text-xl text-cyan-500">PrintFlow</h1>

      <div className="flex items-center gap-4">
        {token ? (
          <Button onClick={handleLogout} className={`cursor-pointer`}>Logout</Button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
    </>
  )
}

export default Navbar
