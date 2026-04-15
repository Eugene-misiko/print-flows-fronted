import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import {User,Lock,Eye,EyeOff,Sparkles,Mail,Phone,ArrowRight,Loader2,} from "lucide-react";
import { companyAPI } from "@/api/api";

const injectRegisterStyles = () => {
  const id = "register-page-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes reg-fl-a{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-20px) rotate(120deg)}66%{transform:translate(-15px,15px) rotate(240deg)}}
    @keyframes reg-fl-b{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-25px,25px) rotate(-120deg)}66%{transform:translate(20px,-10px) rotate(-240deg)}}
    @keyframes reg-slide-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes reg-fade-in{from{opacity:0}to{opacity:1}}
    @keyframes reg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes reg-float-d{animation:reg-float 6s ease-in-out 2s infinite}
    @keyframes reg-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .reg-su{animation:reg-slide-up .7s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .reg-fi{animation:reg-fade-in .5s ease forwards;opacity:0}
    .reg-fl-a{animation:reg-fl-a 14s ease-in-out infinite}
    .reg-fl-b{animation:reg-fl-b 17s ease-in-out infinite}
    .reg-float{animation:reg-float 6s ease-in-out infinite}
    .reg-spin{animation:reg-spin .7s linear infinite}
  `;
  document.head.appendChild(s);
};

const UserRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(null);
  const { companySlug } = useParams();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    injectRegisterStyles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

useEffect(() => {
  const fetchCompany = async () => {
    try {
      const res = await companyAPI.getCompanies();

      const company = res.data.find(
        (c) => c.slug === companySlug
      );

      if (!company) {
        toast.error("Company not found");
        return;
      }

      setCompanyId(company.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load company");
    }
  };

  if (companySlug) fetchCompany();
}, [companySlug]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!companyId) {
    toast.error("Company not loaded. Please refresh page.");
    return;
  }

  if (!form.first_name.trim()) return toast.error("First name is required");
  if (!form.last_name.trim()) return toast.error("Last name is required");
  if (!form.email.trim()) return toast.error("Email is required");
  if (!form.password) return toast.error("Password is required");
  if (form.password.length < 8)
    return toast.error("Password must be at least 8 characters");

  const payload = {
    company_id: companyId,
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    phone: form.phone,
    password: form.password,
    role: "client",
  };

  console.log("REGISTER PAYLOAD:", payload);

  try {
    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully! Please login");
      navigate(`/store/${companySlug}/login`);
    } else {
      console.log("REGISTER ERROR:", result);
      toast.error(result.payload || "Registration failed");
    }
  } catch (err) {
    console.error("REGISTER EXCEPTION:", err);
    toast.error("Something went wrong");
  }
};

  const handleFocus = (e, fieldName) => {
    setFocusedField(fieldName);
    if (e.target.hasAttribute("readonly")) {
      e.target.removeAttribute("readonly");
    }
  };

  const inputClasses = (fieldName) =>
    `w-full pl-11 pr-4 py-3 bg-stone-50/80 dark:bg-stone-800/60 border ${
      focusedField === fieldName
        ? "border-[#c2410c]/30 dark:border-[#c2410c]/40 ring-2 ring-[#c2410c]/20 dark:ring-[#c2410c]/30 bg-white dark:bg-stone-800"
        : "border-stone-200/60 dark:border-stone-700/50 hover:border-stone-300/70 dark:hover:border-stone-600/50"
    } rounded-xl text-sm text-[#1c1917] dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none transition-all duration-200`;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col relative overflow-hidden transition-colors duration-300">

      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="reg-fl-a absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#c2410c]/8 dark:bg-[#c2410c]/4 blur-[130px]" />
        <div className="reg-fl-b absolute -bottom-[15%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[#92400e]/8 dark:bg-[#92400e]/4 blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(28,25,23,.03) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div className="reg-float absolute top-[12%] right-[10%] w-14 h-14 rounded-2xl border border-[#c2410c]/10 dark:border-[#c2410c]/5 rotate-12 opacity-40 hidden lg:block" />
        <div className="reg-float-d absolute bottom-[22%] left-[7%] w-10 h-10 rounded-full border border-[#f97316]/10 dark:border-[#f97316]/5 opacity-30 hidden lg:block" />
        <div className="reg-float absolute top-[55%] right-[6%] w-6 h-6 rounded-lg bg-[#c2410c]/5 dark:bg-[#c2410c]/[0.03] rotate-45 opacity-50 hidden lg:block" />
      </div>

      {/* ─── TOP BAR ─── */}
      <div className="reg-fi relative z-10 px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-md shadow-orange-600/20 dark:shadow-orange-600/10 group-hover:shadow-lg group-hover:shadow-orange-600/30 transition-shadow duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-[#1c1917] dark:text-stone-100 tracking-tight">
              Print<span className="text-[#c2410c]">Flow</span>
            </span>
          </Link>
          <Link
            to={`/store/${companySlug}/login`}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-stone-200/60 dark:border-stone-700/60 rounded-xl hover:bg-white dark:hover:bg-stone-800 hover:border-stone-300/70 dark:hover:border-stone-600/60 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10 relative z-10">
        <div className="w-full max-w-[460px]">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="reg-su inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] shadow-xl shadow-orange-600/20 dark:shadow-orange-600/10 mb-5">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="reg-su text-2xl sm:text-3xl font-black text-[#1c1917] dark:text-stone-100 tracking-tight" style={{ animationDelay: ".08s" }}>
              Create your account
            </h1>
            <p className="reg-su text-stone-500 dark:text-stone-400 text-sm sm:text-[15px] mt-2" style={{ animationDelay: ".14s" }}>
              Join PrintFlow and start ordering
            </p>
          </div>

          {/* Card */}
          <div
            className="reg-su bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-stone-200/60 dark:border-stone-700/50 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/20 dark:shadow-stone-900/30"
            style={{ animationDelay: ".2s" }}
          >
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">

              {/* Error Banner */}
              {error && (
                <div className="reg-fi flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200/70 dark:border-red-800/40 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Section Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="h-px bg-stone-200/60 dark:bg-stone-700/50 flex-1" />
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Personal Info
                </span>
                <div className="h-px bg-stone-200/60 dark:bg-stone-700/50 flex-1" />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                    focusedField === "first_name" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                  }`} />
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    onFocus={(e) => handleFocus(e, "first_name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="First name"
                    readOnly
                    className={inputClasses("first_name")}
                  />
                </div>
                <div className="relative">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                    focusedField === "last_name" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                  }`} />
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    onFocus={(e) => handleFocus(e, "last_name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Last name"
                    readOnly
                    className={inputClasses("last_name")}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                  focusedField === "email" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                }`} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={(e) => handleFocus(e, "email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  readOnly
                  autoComplete="off"
                  className={inputClasses("email")}
                />
              </div>

              {/* Phone Field */}
              <div className="relative">
                <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                  focusedField === "phone" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                }`} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={(e) => handleFocus(e, "phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Phone number (optional)"
                  readOnly
                  autoComplete="off"
                  className={inputClasses("phone")}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                  focusedField === "password" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={(e) => handleFocus(e, "password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create password"
                  readOnly
                  autoComplete="new-password"
                  className={inputClasses("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-200 rounded-md"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>

              <p className="text-[12px] text-stone-400 dark:text-stone-500 -mt-1.5 pl-1">
                Must be at least 8 characters
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:from-[#a3360a] hover:to-[#c2410c] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="reg-spin w-4 h-4 text-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Link */}
          <p className="reg-su text-center mt-6 text-sm text-stone-500 dark:text-stone-400" style={{ animationDelay: ".32s" }}>
            Already have an account?{" "}
            <Link
              to={`/store/${companySlug}/login`}
              className="font-semibold text-[#c2410c] hover:text-[#a3360a] dark:hover:text-[#f97316] transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ─── BOTTOM TEXT ─── */}
      <div className="reg-fi relative z-10 pb-5 text-center" style={{ animationDelay: ".5s" }}>
        <p className="text-[11px] text-stone-400 dark:text-stone-600">
          © 2025 PrintFlow ·{" "}
          <Link to={`/store/${companySlug}/privacy`} className="hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200">Privacy</Link>
          {" · "}
          <Link to={`/store/${companySlug}/terms`} className="hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200">Terms</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;