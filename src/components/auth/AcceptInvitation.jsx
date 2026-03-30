import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerWithInvitation,
} from "../../store/slices/authSlice";
import {
  fetchInvitationByToken,
  clearCurrentInvitation,
} from "../../store/slices/usersSlice";
import toast from "react-hot-toast";
import {
  Printer,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const AcceptInvitation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const {
    currentInvitation,
    isLoading: invitationLoading,
    error: invitationError,
  } = useSelector((state) => state.users);

  const {
    isLoading: authLoading,
    error: authError,
  } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Fetch invitation on load
  useEffect(() => {
    if (token) {
      dispatch(fetchInvitationByToken(token));
    }

    return () => {
      dispatch(clearCurrentInvitation());
    };
  }, [dispatch, token]);

  // Autofill email
  useEffect(() => {
    if (currentInvitation?.email) {
      setForm((prev) => ({
        ...prev,
        email: currentInvitation.email,
      }));
    }
  }, [currentInvitation]);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentInvitation) {
      return toast.error("Invitation not found");
    }

    const isValid =
      currentInvitation?.is_valid && !currentInvitation?.is_expired;

    if (!isValid) {
      return toast.error("Invalid or expired invitation");
    }

    if (!form.first_name.trim())
      return toast.error("First name is required");

    if (!form.last_name.trim())
      return toast.error("Last name is required");

    if (!form.password)
      return toast.error("Password is required");

    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters");

    if (form.password !== form.password_confirm)
      return toast.error("Passwords do not match");

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
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  const isLoading = invitationLoading || authLoading;

  // Loading state
  if (!currentInvitation && !invitationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-500">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (invitationError && !currentInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Invalid Invitation</h2>
          <p className="text-gray-500 mt-2">{invitationError}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const isValid =
    currentInvitation?.is_valid && !currentInvitation?.is_expired;

  const roleDisplay =
    currentInvitation?.role_display || currentInvitation?.role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <Printer className="w-10 h-10 text-orange-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Accept Invitation</h1>
          <p className="text-gray-500">
            Join {currentInvitation?.company_name} as a {roleDisplay}
          </p>
        </div>

        {/* Invitation Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
          <div className="flex gap-2 items-center">
            <CheckCircle className="text-cyan-600" />
            <p className="text-sm text-cyan-800">
              Invited by {currentInvitation?.invited_by_name}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {!isValid && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded mb-4 text-sm">
              This invitation has expired.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {authError && (
              <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
                {authError}
              </div>
            )}

            <input
              type="email"
              value={form.email}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                required
              />
              <input
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
                required
              />
            </div>
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"/>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-9 pr-10 py-2 border rounded"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <input
              type="password"
              name="password_confirm"
              placeholder="Confirm Password"
              value={form.password_confirm}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
              required/>
            <button
              disabled={isLoading || !isValid}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50">
              {isLoading ? "Creating..." : "Accept & Join"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;