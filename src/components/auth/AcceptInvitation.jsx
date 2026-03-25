import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerWithInvitation } from "../../store/slices/authSlice";
import { fetchInvitationByToken, clearCurrentInvitation } from "../../store/slices/usersSlice";
import toast from "react-hot-toast";
import { Printer, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const AcceptInvitation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const { currentInvitation, isLoading: invitationLoading, error: invitationError } = useSelector((state) => state.users);
  const { isLoading: authLoading, error: authError } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchInvitationByToken(token));
    return () => dispatch(clearCurrentInvitation());
  }, [dispatch, token]);

  useEffect(() => {
    if (currentInvitation?.email) {
      setForm((prev) => ({ ...prev, email: currentInvitation.email }));
    }
  }, [currentInvitation]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.first_name.trim()) return toast.error("First name is required");
    if (!form.last_name.trim()) return toast.error("Last name is required");
    if (!form.password) return toast.error("Password is required");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (form.password !== form.password_confirm) return toast.error("Passwords do not match");

    const result = await dispatch(
      registerWithInvitation({
        invitation_token: token,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        password_confirm: form.password_confirm,
        phone: form.phone,
      })
    );

    if (registerWithInvitation.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }
  };

  const isLoading = invitationLoading || authLoading;

  if (!currentInvitation && !invitationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (invitationError && !currentInvitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Invalid Invitation</h2>
          <p className="text-gray-500 mt-2">{invitationError}</p>
          <a href="/login"
            className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const isValid = currentInvitation?.is_valid && !currentInvitation?.is_expired;
  const roleDisplay = currentInvitation?.role_display || currentInvitation?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Accept Invitation</h1>
          <p className="text-gray-500 mt-1">Join {currentInvitation?.company_name}</p>
        </div>

        {/* Invitation Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-cyan-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-cyan-800 font-medium">
                You've been invited as a <strong>{roleDisplay}</strong>
              </p>
              <p className="text-xs text-cyan-600 mt-0.5">Invited by {currentInvitation?.invited_by_name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!isValid && currentInvitation && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg mb-4 text-sm">
              This invitation has expired. Contact the administrator.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+254712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Creating Account..." : "Accept & Join"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;