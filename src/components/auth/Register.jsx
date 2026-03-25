import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerCompany, clearError } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { Building2, User, Lock, Eye, EyeOff, Printer } from "lucide-react";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_city: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_name.trim()) return toast.error("Company name is required");
    if (!form.company_email.trim()) return toast.error("Company email is required");
    if (!form.admin_first_name.trim()) return toast.error("Admin first name is required");
    if (!form.admin_last_name.trim()) return toast.error("Admin last name is required");
    if (!form.admin_email.trim()) return toast.error("Admin email is required");

    if (!form.admin_password) return toast.error("Password is required");
    if (form.admin_password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    const company_slug = form.company_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const payload = {
      ...form,
      company_slug,
      company_country: "Kenya",
    };

    const result = await dispatch(registerCompany(payload));

    if (registerCompany.fulfilled.match(result)) {
      toast.success("Company registered successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Company</h1>
          <p className="text-gray-500 mt-1">Create your PrintFlow account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* COMPANY SECTION */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Company Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="Company Name *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />

                <input
                  name="company_email"
                  value={form.company_email}
                  onChange={handleChange}
                  placeholder="Company Email *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />

                <input
                  name="company_phone"
                  value={form.company_phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  name="company_city"
                  value={form.company_city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  name="company_address"
                  value={form.company_address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full px-4 py-2.5 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* ADMIN SECTION */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Admin Account
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  name="admin_first_name"
                  value={form.admin_first_name}
                  onChange={handleChange}
                  placeholder="First Name *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  name="admin_last_name"
                  value={form.admin_last_name}
                  onChange={handleChange}
                  placeholder="Last Name *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  name="admin_email"
                  value={form.admin_email}
                  onChange={handleChange}
                  placeholder="Admin Email *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  name="admin_phone"
                  value={form.admin_phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                {/* PASSWORD */}
                <div className="md:col-span-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="admin_password"
                    value={form.admin_password}
                    onChange={handleChange}
                    placeholder="Password *"
                    className="w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 cursor-pointer transition-all shadow-md"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>

          </form>

          {/* FOOTER */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-600 font-medium hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;