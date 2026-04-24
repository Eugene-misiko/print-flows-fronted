import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {registerCompany,clearError,validateInvitationToken,} from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import {Building2,User,Lock,Eye,EyeOff,Printer,Mail,Phone,MapPin,CheckCircle2,Loader2,} from "lucide-react";

// ─── Tiny reusable field wrapper ───────────────────────────────────────────
const Field = ({ label, icon: Icon, children, span }) => (
  <div className={span ? "md:col-span-2" : ""}>
    {label && (
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      {React.cloneElement(children, {
        className: [
          "w-full py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all duration-200",
          "disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed",
          "bg-slate-50 border-slate-200",
          Icon ? "pl-10 pr-4" : "px-4",
          children.props.className || "",
        ]
          .filter(Boolean)
          .join(" "),
      })}
    </div>
  </div>
);

// ─── Section heading ────────────────────────────────────────────────────────
const SectionHeading = ({ icon: Icon, title, color = "orange" }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        color === "orange"
          ? "bg-orange-100 text-orange-600"
          : "bg-blue-100 text-blue-600"
      }`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
      {title}
    </h3>
    <div className="flex-1 h-px bg-slate-100 ml-2" />
  </div>
);

// ─── Full-screen loading overlay shown while validating token ───────────────
const TokenValidating = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center gap-6">
    {/* Animated logo */}
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 blur-xl opacity-30 scale-110 animate-pulse" />
      <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
        <Printer className="w-10 h-10 text-white" />
      </div>
    </div>

    {/* Spinner + label */}
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-slate-600 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
        <span>Validating your invitation…</span>
      </div>
      <p className="text-xs text-slate-400 max-w-xs text-center">
        Please wait while we verify your invitation link. This only takes a
        moment.
      </p>
    </div>

    {/* Progress bar */}
    <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-[progressBar_1.8s_ease-in-out_infinite]"
        style={{ width: "60%" }}
      />
    </div>

    <style>{`
      @keyframes progressBar {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
    `}</style>
  </div>
);


//main component

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error } = useSelector((state) => state.auth);

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  //const companyFromUrl = queryParams.get("company");
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isLocal = hostname.includes("localhost");
  const [isValidating, setIsValidating] = useState(!!token);
  const [isInvitation, setIsInvitation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const company_slug = isLocal
  ? generatedSlug
  : subdomain;

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

  // ── Validate token on mount 
  useEffect(() => {
    if (!token) return;

    const validate = async () => {
      const result = await dispatch(validateInvitationToken(token));

      if (validateInvitationToken.fulfilled.match(result)) {
        const data = result.payload;
        setIsInvitation(true);
        setForm((prev) => ({
          ...prev,
          company_name: data.company_name || "",
          company_email: data.email || "",   // backend returns `email`, not company_email
        }));
      } else {
        toast.error("Invalid or expired invitation link.");
      }

      setIsValidating(false);
    };

    validate();
  }, [token, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation 
    if (!form.company_name.trim())
      return toast.error("Company name is required.");
    if (!form.company_email.trim())
      return toast.error("Company email is required.");
    if (!form.admin_first_name.trim())
      return toast.error("First name is required.");
    if (!form.admin_last_name.trim())
      return toast.error("Last name is required.");
    if (!form.admin_email.trim()) return toast.error("Admin email is required.");
    if (!form.admin_password) return toast.error("Password is required.");
    if (form.admin_password.length < 8)
      return toast.error("Password must be at least 8 characters.");

    const generatedSlug = form.company_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const company_slug = companyFromUrl || generatedSlug;

    const payload = {
      ...form,
      company_slug,
      company_country: "Kenya",
      token,
    };

    const result = await dispatch(registerCompany(payload));

    if (registerCompany.fulfilled.match(result)) {
      toast.success("Company registered successfully!");
      const isLocal = window.location.hostname === "localhost";
     const target = isLocal
  ? "http://localhost:5173/app/dashboard"
  : "/app/dashboard";

window.location.href = target;
    } else {
      toast.error(result.payload || "Registration failed. Please try again.");
    }
  };

  // ── Token validation screen 
  if (isValidating) return <TokenValidating />;

  // Main form 
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-start justify-center p-4 py-10">
      <div className="w-full max-w-3xl">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 blur-xl opacity-30 scale-110" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25">
              <Printer className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isInvitation ? "Complete Your Registration" : "Register Your Company"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isInvitation
              ? "Your invitation is valid. Fill in the details below to get started."
              : "Set up your PrintFlow workspace in minutes."}
          </p>

          {/* Invitation badge */}
          {isInvitation && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Invitation verified
            </div>
          )}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">

          {/* Global error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
              <Lock className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* ── Company Details ── */}
            <div>
              <SectionHeading icon={Building2} title="Company Details" color="orange" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company Name" icon={Building2}>
                  <input
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    disabled={isInvitation}
                    placeholder="Acme Printing Co."
                  />
                </Field>

                <Field label="Company Email" icon={Mail}>
                  <input
                    name="company_email"
                    type="email"
                    value={form.company_email}
                    onChange={handleChange}
                    disabled={isInvitation}
                    placeholder="hello@company.com"
                  />
                </Field>

                <Field label="Phone" icon={Phone}>
                  <input
                    name="company_phone"
                    value={form.company_phone}
                    onChange={handleChange}
                    placeholder="+254 700 000 000"
                  />
                </Field>

                <Field label="City" icon={MapPin}>
                  <input
                    name="company_city"
                    value={form.company_city}
                    onChange={handleChange}
                    placeholder="Nairobi"
                  />
                </Field>

                <Field label="Address" span>
                  <input
                    name="company_address"
                    value={form.company_address}
                    onChange={handleChange}
                    placeholder="123 Print Street, Industrial Area"
                  />
                </Field>
              </div>
            </div>

            {/* ── Admin Account ── */}
            <div>
              <SectionHeading icon={User} title="Admin Account" color="blue" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name" icon={User}>
                  <input
                    name="admin_first_name"
                    value={form.admin_first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                  />
                </Field>

                <Field label="Last Name" icon={User}>
                  <input
                    name="admin_last_name"
                    value={form.admin_last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <input
                    name="admin_email"
                    type="email"
                    value={form.admin_email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                  />
                </Field>

                <Field label="Phone" icon={Phone}>
                  <input
                    name="admin_phone"
                    value={form.admin_phone}
                    onChange={handleChange}
                    placeholder="+254 700 000 000"
                  />
                </Field>

                {/* Password with toggle */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="admin_password"
                      value={form.admin_password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength hint */}
                  {form.admin_password && (
                    <div className="mt-2 flex items-center gap-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            form.admin_password.length >= level * 3
                              ? form.admin_password.length >= 12
                                ? "bg-emerald-500"
                                : form.admin_password.length >= 8
                                ? "bg-orange-400"
                                : "bg-red-400"
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {form.admin_password.length < 8
                          ? "Too short"
                          : form.admin_password.length < 12
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-600 hover:to-red-700 active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your workspace…
                </>
              ) : (
                "Create Company Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-600 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;