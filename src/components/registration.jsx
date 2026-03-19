import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/slices/authslice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage from "../assets/printImg.png";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registerLoading, registerError, registerSuccess } = useSelector(
    (state) => state.auth
  );
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "client", 
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
    if (registerSuccess) {
      toast.success("Registration successful! Please login.");
      navigate("/login");
    }
  }, [registerSuccess, navigate]);

  useEffect(() => {
    if (registerError) {
      const errorMsg = typeof registerError === 'string' 
        ? registerError 
        : Object.values(registerError).flat().join(", ");
      toast.error(errorMsg || "Registration failed");
    }
  }, [registerError]);

  return (
    <>
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center py-12"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div
          className="relative z-10 w-full max-w-lg px-10 py-10 rounded-2xl 
          bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-center text-emerald-600 mb-2">
            Create Account
          </h1>

          <p className="text-center text-gray-200 text-sm mb-8">
            Register to start managing your printing orders
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-style"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone (Optional)"
              value={formData.phone}
              onChange={handleChange}
              className="input-style"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="input-style"
            >
              <option value="" disabled>Select Role</option>
              <option value="client">Client</option>
              <option value="designer">Designer</option>
              <option value="printer">Printer</option>
         
              <option value="admin">Admin</option> 
            </select>

            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-style"
            />

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
            >
              {registerLoading ? "Registering..." : "Create Account"}
            </button>

            <p className="text-center text-gray-200 mt-4 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-500 font-medium hover:underline"
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
          padding:12px 14px;
          border-radius:8px;
          border:none;
          background:rgba(255,255,255,0.75);
          outline:none;
          transition:all .2s ease;
          font-size: 0.95rem;
        }
        .input-style:focus{
          box-shadow:0 0 0 2px #10b981;
        }
        `}
      </style>
    </>
  );
}