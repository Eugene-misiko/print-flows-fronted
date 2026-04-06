import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, fetchCompanies, clearError } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import {Building2,User,Lock,Eye,EyeOff,Printer,Mail,Phone,ChevronDown,ArrowRight,Loader2,Search,X,Check,} from "lucide-react";

const UserRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, companies } = useSelector((state) => state.auth);
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
  const [focusedField, setFocusedField] = useState(null);
  // Company search state
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const companyRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        companyRef.current &&
        !companyRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearch(company.name);
    setForm({ ...form, company_id: company.id });
    setShowCompanyDropdown(false);
  };
  const handleCompanyClear = () => {
    setSelectedCompany(null);
    setCompanySearch("");
    setForm({ ...form, company_id: "" });
  };
  const handleCompanyInputChange = (e) => {
    const value = e.target.value;
    setCompanySearch(value);
    setSelectedCompany(null);
    setForm({ ...form, company_id: "" });
    if (!showCompanyDropdown) setShowCompanyDropdown(true);
  };
  const filteredCompanies = companies
    ? companies.filter((c) =>
        c.name.toLowerCase().includes(companySearch.toLowerCase())
      )
    : [];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_id) return toast.error("Please select a company");
    if (!form.first_name.trim()) return toast.error("First name is required");
    if (!form.last_name.trim()) return toast.error("Last name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.password) return toast.error("Password is required");
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    const result = await dispatch(registerUser(form));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  const handleFocus = (e, fieldName) => {
    setFocusedField(fieldName);
    if (e.target.hasAttribute("readonly")) {
      e.target.removeAttribute("readonly");
    }
  };

  const inputClasses = (fieldName) =>
    `w-full bg-[#faf8f6] border ${
      focusedField === fieldName
        ? "border-orange-400 ring-2 ring-orange-500/10"
        : "border-[#e8e4df] hover:border-[#d5d0ca]"
    } rounded-xl px-11 py-3.5 text-[#2d2a26] placeholder-[#b5afa8] outline-none transition-all duration-200 text-[15px]`;

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-300/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-300/15 rounded-full blur-[100px]" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-amber-200/10 rounded-full blur-[80px]" />
      <div className="w-full max-w-[520px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-[72px] h-[72px] bg-gradient-to-br from-[#e8620a] to-[#c93d1a] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-300/30">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-[#1a1714] tracking-tight">
            Create your account
          </h1>
          <p className="text-[#8a8279] mt-2 text-[15px]">
            Get started with PrintFlow today
          </p>
        </div>
        {/* Card */}
        <div className="bg-[#fffcf9] rounded-2xl shadow-xl shadow-[#e8e4df]/60 border border-[#ece7e1] p-8">
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}
            {/* COMPANY SEARCH */}
            <div>
              <label className="block text-[12px] font-semibold text-[#6b6560] uppercase tracking-wider mb-2">
                Company
              </label>
              <div className="relative" ref={companyRef}>
                <div className="relative">
                  {selectedCompany ? (
                    <Check className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500 w-[18px] h-[18px] pointer-events-none" />
                  ) : (
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] w-[18px] h-[18px] pointer-events-none" />
                  )}
                  <input
                    type="text"
                    value={companySearch}
                    onChange={handleCompanyInputChange}
                    onFocus={() => {
                      if (!selectedCompany) setShowCompanyDropdown(true);
                    }}
                    placeholder="Search company by name..."
                    autoComplete="off"
                    className={`w-full bg-[#faf8f6] border ${
                      selectedCompany
                        ? "border-green-300 ring-1 ring-green-500/10"
                        : showCompanyDropdown
                        ? "border-orange-400 ring-2 ring-orange-500/10"
                        : "border-[#e8e4df] hover:border-[#d5d0ca]"
                    } rounded-xl pl-11 pr-10 py-3.5 text-[#2d2a26] placeholder-[#b5afa8] outline-none transition-all duration-200 text-[15px]`}/>
                  {companySearch && (
                    <button
                      type="button"
                      onClick={handleCompanyClear}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] hover:text-[#6b6560] transition-colors p-0.5"
                      tabIndex={-1}>
                      <X className="w-[16px] h-[16px]" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showCompanyDropdown && !selectedCompany && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-[#fffcf9] border border-[#ece7e1] rounded-xl shadow-xl shadow-[#e8e4df]/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="max-h-[220px] overflow-y-auto overscroll-contain">
                      {companySearch.trim() === "" ? (
                        <div className="px-4 py-8 text-center text-[13px] text-[#b5afa8]">
                          <Search className="w-5 h-5 mx-auto mb-2 opacity-50" />
                          Type to search for your company
                        </div>
                      ) : filteredCompanies.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[13px] text-[#b5afa8]">
                          <Building2 className="w-5 h-5 mx-auto mb-2 opacity-50" />
                          No company found for &ldquo;{companySearch}&rdquo;
                        </div>
                      ) : (
                        <>
                          <div className="px-4 py-2 text-[11px] font-semibold text-[#b5afa8] uppercase tracking-wider border-b border-[#ece7e1] bg-[#faf8f6]">
                            {filteredCompanies.length} result
                            {filteredCompanies.length > 1 ? "s" : ""} found
                          </div>
                          {filteredCompanies.map((company) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => handleCompanySelect(company)}
                              className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-100 flex items-center gap-3 border-b border-[#f0ece7] last:border-0 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#f0ece7] group-hover:bg-orange-100 flex items-center justify-center shrink-0 transition-colors">
                                <Building2 className="w-4 h-4 text-[#8a8279] group-hover:text-orange-600 transition-colors" />
                              </div>
                              <span className="text-[14px] text-[#2d2a26] font-medium truncate">
                                {company.name}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px bg-[#ece7e1] flex-1" />
              <span className="text-[11px] font-semibold text-[#b5afa8] uppercase tracking-wider">
                Personal Info
              </span>
              <div className="h-px bg-[#ece7e1] flex-1" />
            </div>

            {/* NAME FIELDS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] w-[18px] h-[18px] pointer-events-none" />
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  onFocus={(e) => handleFocus(e, "first_name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="First name"
                  readOnly
                  className={inputClasses("first_name")} />
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] w-[18px] h-[18px] pointer-events-none" />
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
            {/* EMAIL FIELD */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] w-[18px] h-[18px] pointer-events-none" />
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
                className={inputClasses("email")}/>
            </div>
            {/* PHONE FIELD */}
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] w-[18px] h-[18px] pointer-events-none" />
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
            {/* PASSWORD FIELD */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] w-[18px] h-[18px] pointer-events-none" />
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
                className={inputClasses("password")}/>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5afa8] hover:text-[#6b6560] transition-colors p-0.5"
                tabIndex={-1}>
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
            <p className="text-[12px] text-[#b5afa8] -mt-2">
              Must be at least 8 characters
            </p>
            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e8620a] to-[#c93d1a] text-white py-3.5 rounded-xl font-semibold text-[15px] hover:from-[#d4570a] hover:to-[#b33518] active:scale-[0.98] cursor-pointer transition-all duration-200 shadow-lg shadow-orange-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          {/* Footer */}
          <p className="text-center mt-7 text-[14px] text-[#8a8279]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#c93d1a] font-semibold hover:text-[#a83215] hover:underline underline-offset-2 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;