import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/slices/authslice";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import backgroundImage from "../assets/printImg.png";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { registerLoading, registerError, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };
  useEffect(() => {
    if (user) {
      setFormData({
        username: "",
        email: "",
        phone: "",
        first_name: "",
        last_name: "",
        password: "",
      });

      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <div
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl 
            bg-white/20 backdrop-blur-xl 
            border border-white/30 
            shadow-2xl shadow-black/40">

          <h1 className="text-2xl font-bold text-center mb-6 text-cyan-500">
            Register
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="input-style"
            />

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="input-style"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-style"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-style"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-style"
            />

            <button
              type="submit"
              disabled={registerLoading}
              className="mt-6 shadow-[0_0_5px_cyan,0_0_25px_cyan] 
                hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan,0_0_100px_cyan]
                transition-all duration-300 ease-in-out
                px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg w-full"
            >
              {registerLoading ? "Registering..." : "Register"}
            </button>

            {registerError && (
              <p className="text-red-500 text-sm text-center">
                {typeof registerError === "string"
                  ? registerError
                  : "Registration failed"}
              </p>
            )}

            <p className="text-center text-white mt-4">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>

      
      <style>
        {`
          .input-style {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ccc;
            background: rgba(255,255,255,0.8);
            outline: none;
          }
        `}
      </style>
    </>
  );
}