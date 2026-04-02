import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, fetchCompanies, clearError } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { Building2, User, Lock, Eye, EyeOff, Printer } from "lucide-react";

const UserRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

 const { isLoading, error, companies } = useSelector((state) => state.auth);
 console.log(companies);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    company_id: "", 
    role: "client", 
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validations
    if (!form.company_id) return toast.error("Please select a company");
    if (!form.first_name.trim()) return toast.error("First name is required");
    if (!form.last_name.trim()) return toast.error("Last name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.password) return toast.error("Password is required");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");

    // Dispatch the registerUser action
    const result = await dispatch(registerUser(form));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
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
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join a company on PrintFlow</p>
        </div>

    
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* COMPANY SELECTION SECTION */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Select Company
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-gray-700"
                >
                  <option value="">Select Your Company *</option>
                  {/* Check if companies exist before mapping */}
                    {companies && companies.map((company) => (
                    <option key={company.id} value={company.id}>
                        {company.name}
                    </option>
                    ))}
                </select>
              </div>
            </div>

            {/* USER DETAILS SECTION */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Your Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First Name *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />

                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last Name *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address *"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                {/* PASSWORD INPUT */}
                <div className="md:col-span-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 cursor-pointer transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Register as Client"}
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

export default UserRegister;