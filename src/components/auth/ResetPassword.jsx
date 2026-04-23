import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authAPI } from "../../api/api";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2, Printer } from "lucide-react";

const injectStyles = () => {
  const id = "reset-pw-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes rp-fl-a{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-20px) rotate(120deg)}66%{transform:translate(-15px,15px) rotate(240deg)}}
    @keyframes rp-fl-b{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-25px,25px) rotate(-120deg)}66%{transform:translate(20px,-10px) rotate(-240deg)}}
    @keyframes rp-su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes rp-fi{from{opacity:0}to{opacity:1}}
    @keyframes rp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes rp-float-d{animation:rp-float 6s ease-in-out 2s infinite}
    @keyframes rp-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .rp-su{animation:rp-su .7s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .rp-fi{animation:rp-fi .5s ease forwards;opacity:0}
    .rp-fl-a{animation:rp-fl-a 14s ease-in-out infinite}
    .rp-fl-b{animation:rp-fl-b 17s ease-in-out infinite}
    .rp-float{animation:rp-float 6s ease-in-out infinite}
    .rp-spin{animation:rp-spin .7s linear infinite}
  `;
  document.head.appendChild(s);
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [form, setForm] = useState({
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    injectStyles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.password_confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.confirmPasswordReset({
        token,
        new_password: form.password,
        new_password_confirm: form.password_confirm,
      });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (fieldName) =>
    `w-full pl-11 pr-4 py-3 bg-stone-50/80 dark:bg-stone-800/60 border ${
      focusedField === fieldName
        ? "border-[#c2410c]/30 dark:border-[#c2410c]/40 ring-2 ring-[#c2410c]/20 dark:ring-[#c2410c]/30 bg-white dark:bg-stone-800"
        : "border-stone-200/60 dark:border-stone-700/50 hover:border-stone-300/70 dark:hover:border-stone-600/50"
    } rounded-xl text-sm text-[#1c1917] dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none transition-all duration-200`;

  const passwordRight = (show, toggle) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-200 rounded-md"
      tabIndex={-1}
    >
      {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col relative overflow-hidden transition-colors duration-300">

      {/* ─── BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="rp-fl-a absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#c2410c]/8 dark:bg-[#c2410c]/4 blur-[130px]" />
        <div className="rp-fl-b absolute -bottom-[15%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[#92400e]/8 dark:bg-[#92400e]/4 blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(28,25,23,.03) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div className="rp-float absolute top-[12%] right-[10%] w-14 h-14 rounded-2xl border border-[#c2410c]/10 dark:border-[#c2410c]/5 rotate-12 opacity-40 hidden lg:block" />
        <div className="rp-float-d absolute bottom-[22%] left-[7%] w-10 h-10 rounded-full border border-[#f97316]/10 dark:border-[#f97316]/5 opacity-30 hidden lg:block" />
      </div>

      {/* ─── TOP BAR ─── */}
      <div className="rp-fi relative z-10 px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-md shadow-orange-600/20 dark:shadow-orange-600/10 group-hover:shadow-lg group-hover:shadow-orange-600/30 transition-shadow duration-300">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-[#1c1917] dark:text-stone-100 tracking-tight">
              Print<span className="text-[#c2410c]">Flow</span>
            </span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-stone-200/60 dark:border-stone-700/60 rounded-xl hover:bg-white dark:hover:bg-stone-800 hover:border-stone-300/70 dark:hover:border-stone-600/60 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="rp-su inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] shadow-xl shadow-orange-600/20 dark:shadow-orange-600/10 mb-5">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="rp-su text-2xl sm:text-3xl font-black text-[#1c1917] dark:text-stone-100 tracking-tight" style={{ animationDelay: ".08s" }}>
              Reset password
            </h1>
            <p className="rp-su text-stone-500 dark:text-stone-400 text-sm sm:text-[15px] mt-2" style={{ animationDelay: ".14s" }}>
              Enter your new password below
            </p>
          </div>

          {/* Card */}
          <div
            className="rp-su bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-stone-200/60 dark:border-stone-700/50 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/20 dark:shadow-stone-900/30"
            style={{ animationDelay: ".2s" }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* New Password */}
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  New Password
                </label>
                <div className={`relative rounded-xl transition-all duration-200 ${
                  focusedField === "password"
                    ? "ring-2 ring-[#c2410c]/20 dark:ring-[#c2410c]/30"
                    : ""
                }`}>
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                    focusedField === "password" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className={inputClasses("password")}
                  />
                  {passwordRight(showPassword, () => setShowPassword(!showPassword))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Confirm Password
                </label>
                <div className={`relative rounded-xl transition-all duration-200 ${
                  focusedField === "password_confirm"
                    ? "ring-2 ring-[#c2410c]/20 dark:ring-[#c2410c]/30"
                    : ""
                }`}>
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                    focusedField === "password_confirm" ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"
                  }`} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="password_confirm"
                    value={form.password_confirm}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password_confirm")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={inputClasses("password_confirm")}
                  />
                  {passwordRight(showConfirm, () => setShowConfirm(!showConfirm))}
                </div>
              </div>

              {/* Validation hint */}
              <div className="flex items-center gap-2 pt-0.5 pl-1">
                {form.password && form.password_confirm ? (
                  form.password === form.password_confirm ? (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Passwords match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 dark:text-red-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Passwords do not match
                    </span>
                  )
                ) : (
                  <span className="text-[12px] text-stone-400 dark:text-stone-500">
                    Must be at least 8 characters
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:from-[#a3360a] hover:to-[#c2410c] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="rp-spin w-4 h-4 text-white" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom link */}
          <p className="rp-su text-center mt-6 text-sm text-stone-500 dark:text-stone-400" style={{ animationDelay: ".32s" }}>
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#c2410c] hover:text-[#a3360a] dark:hover:text-[#f97316] transition-colors duration-200"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div className="rp-fi relative z-10 pb-5 text-center" style={{ animationDelay: ".5s" }}>
        <p className="text-[11px] text-stone-400 dark:text-stone-600">
          &copy; {new Date().getFullYear()} PrintFlow ·{" "}
          <Link to="/privacy" className="hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200">Privacy</Link>
          {" · "}
          <Link to="/terms" className="hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200">Terms</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;