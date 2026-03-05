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
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        
        <div className="absolute inset-0 bg-black/60"></div>

        
        <div
          className="relative z-10 w-full max-w-lg px-10 py-10 rounded-2xl
          bg-white/20 backdrop-blur-xl
          border border-white/30
          shadow-2xl"
        >
          
          <h1 className="text-3xl font-bold text-center text-rose-600 mb-2">
            Create Account
          </h1>

          <p className="text-center text-gray-200 text-sm mb-8">
            Register to start managing your printing orders
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
              className="w-full bg-rose-600 hover:bg-rose-700
              text-white font-semibold py-3 rounded-lg
              transition"
            >
              {registerLoading ? "Registering..." : "Register"}
            </button>

            {registerError && (
              <p className="text-red-400 text-sm text-center">
                {typeof registerError === "string"
                  ? registerError
                  : "Registration failed"}
              </p>
            )}

            <p className="text-center text-gray-200 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-rose-400 hover:text-rose-500 font-medium"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
      <style>
        {`
        .input-style{
          width:100%;
          padding:10px 12px;
          border-radius:8px;
          border:none;
          background:rgba(255,255,255,0.75);
          outline:none;
          transition:all .2s ease;
        }
        .input-style:focus{
          box-shadow:0 0 0 2px #f43f5e;
        }
        `}
      </style>
    </>
  );
}