import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/slices/authslice";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import backgroundImage from "../assets/printImg.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate()  
  const dispatch = useDispatch();
  const { registerLoading, registerError, user } = useSelector(
    (state) => state.auth
  );
  const [formData, setFormData] = useState({username: "", email: "", phone: "", password: "", role: "client", });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit registration
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
 const {password} = formData;

    dispatch(registerUser(formData));
  };
  useEffect(() => {
    if (user) {
      navigate("/login"); // redirect to home when login is successful
    }
  }, [registerLoading, navigate]);

  return (
    <>
    <Navbar />
    <div className="relative h-screen bg-cover bg-center flex items-center justify-center
     bg-fixed bg-no-repeat bg-cover "  style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl 
                bg-white/20 backdrop-blur-xl 
                border border-white/30 
                shadow-2xl shadow-black/40 ">
                    
    <h1 className="text-2xl font-bold text-center mb-6 text-cyan-500">Register</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
      <input className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
      <input className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"  type="text"  name="phone"  placeholder="Phone" value={formData.phone} onChange={handleChange} />
     
      <input className={`border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 `  } type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
 <h2 className="font-semibold text-cyan-500 text-center">Select a role</h2>
 <div className="justify-center flex">
<Select 
  name="role" 
  value={formData.role} 
  onValueChange={(value) => handleChange({ target: { name: "role", value } })}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select a role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="client">Client</SelectItem>
    <SelectItem value="designer">Designer</SelectItem>
    <SelectItem value="admin">Admin</SelectItem>
  </SelectContent>
</Select>
</div>
<div className="">
      <button className="mt-10 shadow-[0_0_5px_cyan,0_0_25px_cyan] 
                    hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan,0_0_100px_cyan,0_0_200px_cyan]
                    transition-all duration-300 ease-in-out
                    px-6 py-3 bg-gray-800 text-white text-center font-semibold rounded-lg w-full mb-5" type="submit" disabled={registerLoading}>
        {registerLoading ? "Registering..." : "Register"}
      </button>
      <p className="text-center font-semibold mb-3">Already have an account? <Link to='/login' className="text-white font-thin p-1">Login here</Link></p>
      </div>
      {registerError && <p className="text-red-500">{JSON.stringify(registerError)}</p>}
      {user && <p>Registration successful! Welcome, {user.username}</p>}
     
    </form>
    </div>
    </div>
    </>
  );
}