import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { confirmPasswordReset } from "@/store/slices/authslice";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import backgroundImage from "../assets/printImg.png";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { passwordLoading } = useSelector((state) => state.auth);

  const [passwords, setPasswords] = useState({
    new_password: "",
    new_password_confirm: "",
  });

  let rawUid = searchParams.get("uidb64") || "";
  let rawToken = searchParams.get("token") || "";

  let uidb64 = rawUid.startsWith("3D") ? rawUid.substring(2) : rawUid;
  let token = rawToken.startsWith("3D") ? rawToken.substring(2) : rawToken;

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.new_password_confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    dispatch(confirmPasswordReset({ uidb64, token, ...passwords }))
      .unwrap()
      .then(() => {
        toast.success("Password reset successful! Please login.");
        navigate("/login");
      })
      .catch((err) => {
        console.log("Reset Error:", err);
        toast.error(err?.token || err?.uidb64 || "Failed to reset password");
      });
  };
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 w-full max-w-md px-10 py-10 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-emerald-600">
          Reset Password
        </h2>
        <p className="text-center text-gray-200 text-sm mt-2 mb-6">
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={passwords.new_password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/70 outline-none focus:ring-2 focus:ring-emerald-500 transition"/>
          <input
            type="password"
            name="new_password_confirm"
            placeholder="Confirm New Password"
            value={passwords.new_password_confirm}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/70 outline-none focus:ring-2 focus:ring-emerald-500 transition"/>
          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-50">
            {passwordLoading ? "Saving..." : "Save New Password"}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-emerald-300 hover:text-emerald-200 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;