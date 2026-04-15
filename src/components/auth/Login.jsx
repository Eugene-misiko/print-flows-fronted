import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

const injectLoginStyles = () => {
  const id = "login-page-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes fl-a{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-20px) rotate(120deg)}66%{transform:translate(-15px,15px) rotate(240deg)}}
    @keyframes fl-b{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-25px,25px) rotate(-120deg)}66%{transform:translate(20px,-10px) rotate(-240deg)}}
    @keyframes slide-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fade-in{from{opacity:0}to{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes pulse-ring{0%{transform:scale(1);opacity:.4}100%{transform:scale(2.2);opacity:0}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    .login-su{animation:slide-up .7s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .login-fi{animation:fade-in .5s ease forwards;opacity:0}
    .login-fl-a{animation:fl-a 14s ease-in-out infinite}
    .login-fl-b{animation:fl-b 17s ease-in-out infinite}
    .login-float{animation:float 6s ease-in-out infinite}
    .login-float-d{animation:float 6s ease-in-out 2s infinite}
    .login-pulse{animation:pulse-ring 2s cubic-bezier(0,0,.2,1) infinite}
    .login-shimmer{background-size:200% auto;animation:shimmer 3s linear infinite}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .login-spin{animation:spin .7s linear infinite}
  `;
  document.head.appendChild(s);
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { companySlug } = useParams();
  useEffect(() => {
    injectLoginStyles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!form.password) {
      toast.error("Please enter your password");
      return;
    }

    const result = await dispatch(login(form));

    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      setForm({ email: "", password: "" });
      navigate("/app/dashboard");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col relative overflow-hidden transition-colors duration-300">

      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="login-fl-a absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#c2410c]/8 dark:bg-[#c2410c]/4 blur-[130px]" />
        <div className="login-fl-b absolute -bottom-[15%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[#92400e]/8 dark:bg-[#92400e]/4 blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(28,25,23,.03) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div className="login-float absolute top-[15%] right-[12%] w-14 h-14 rounded-2xl border border-[#c2410c]/10 dark:border-[#c2410c]/5 rotate-12 opacity-40 hidden lg:block" />
        <div className="login-float-d absolute bottom-[20%] left-[8%] w-10 h-10 rounded-full border border-[#f97316]/10 dark:border-[#f97316]/5 opacity-30 hidden lg:block" />
        <div className="login-float absolute top-[60%] right-[8%] w-6 h-6 rounded-lg bg-[#c2410c]/5 dark:bg-[#c2410c]/[0.03] rotate-45 opacity-50 hidden lg:block" />
      </div>

      {/* ─── TOP BAR ─── */}
      <div className="login-fi relative z-10 px-4 sm:px-6 pt-5 sm:pt-6">
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
            to={`/store/${companySlug}/register`}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-stone-200/60 dark:border-stone-700/60 rounded-xl hover:bg-white dark:hover:bg-stone-800 hover:border-stone-300/70 dark:hover:border-stone-600/60 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            Create Account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="login-su inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] shadow-xl shadow-orange-600/20 dark:shadow-orange-600/10 mb-5">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="login-su text-2xl sm:text-3xl font-black text-[#1c1917] dark:text-stone-100 tracking-tight" style={{ animationDelay: ".08s" }}>
              Welcome back
            </h1>
            <p className="login-su text-stone-500 dark:text-stone-400 text-sm sm:text-[15px] mt-2" style={{ animationDelay: ".14s" }}>
              Sign in to your PrintFlow account
            </p>
          </div>

          {/* Card */}
          <div
            className="login-su bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-stone-200/60 dark:border-stone-700/50 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/20 dark:shadow-stone-900/30"
            style={{ animationDelay: ".2s" }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Banner */}
              {error && (
                <div className="login-fi flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200/70 dark:border-red-800/40 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className={`relative rounded-xl transition-all duration-200 ${
                  focusedField === "email"
                    ? "ring-2 ring-[#c2410c]/20 dark:ring-[#c2410c]/30"
                    : ""
                }`}>
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-[#c2410c]"
                      : "text-stone-400 dark:text-stone-500"
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/50 rounded-xl text-sm text-[#1c1917] dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-stone-800 focus:border-[#c2410c]/30 dark:focus:border-[#c2410c]/40"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-semibold text-stone-600 dark:text-stone-300">
                    Password
                  </label>
                  <Link
                   to={`/store/${companySlug}/forgot-password`}
                    className="text-[12px] font-medium text-[#c2410c] hover:text-[#a3360a] dark:hover:text-[#f97316] transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className={`relative rounded-xl transition-all duration-200 ${
                  focusedField === "password"
                    ? "ring-2 ring-[#c2410c]/20 dark:ring-[#c2410c]/30"
                    : ""
                }`}>
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-[#c2410c]"
                      : "text-stone-400 dark:text-stone-500"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/50 rounded-xl text-sm text-[#1c1917] dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-stone-800 focus:border-[#c2410c]/30 dark:focus:border-[#c2410c]/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-200 rounded-md"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:from-[#a3360a] hover:to-[#c2410c] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="login-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Link */}
          <p className="login-su text-center mt-6 text-sm text-stone-500 dark:text-stone-400" style={{ animationDelay: ".32s" }}>
            Don't have an account?{" "}
            <Link
              to={`/store/${companySlug}/register`}
              className="font-semibold text-[#c2410c] hover:text-[#a3360a] dark:hover:text-[#f97316] transition-colors duration-200"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* ─── BOTTOM TEXT ─── */}
      <div className="login-fi relative z-10 pb-5 text-center" style={{ animationDelay: ".5s" }}>
        <p className="text-[11px] text-stone-400 dark:text-stone-600">
          © 2025 PrintFlow ·{" "}
          <Link to={`/store/${companySlug}/privacy`} className="hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200">Privacy</Link>
          {" · "}
          <Link to="/" className="hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200">Terms</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;