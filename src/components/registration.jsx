import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/slices/authslice";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import backgroundImage from "../assets/printImg.png";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registerLoading, registerError } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(resultAction)) {
      // Clear form after success
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
      });

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="relative h-screen bg-cover bg-center flex items-center justify-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

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
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full 
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full 
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full 
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="border border-gray-300 rounded px-3 py-2 w-full 
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={registerLoading}
              className="mt-6 shadow-[0_0_5px_cyan,0_0_25px_cyan] 
              hover:shadow-[0_0_5px_cyan,0_0_25px_cyan,0_0_50px_cyan]
              transition-all duration-300
              px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg w-full"
            >
              {registerLoading ? "Registering..." : "Register"}
            </button>

            {registerError && (
              <p className="text-red-500 text-sm text-center">
                {JSON.stringify(registerError)}
              </p>
            )}

            {success && (
              <p className="text-green-500 text-sm text-center">
                Registration successful! Redirecting to login...
              </p>
            )}

            <p className="text-center font-semibold mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-white font-thin">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}