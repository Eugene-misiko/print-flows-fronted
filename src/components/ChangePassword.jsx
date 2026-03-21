import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, resetPasswordState } from "@/store/slices/authslice";
import { toast } from "react-toastify";
import { useEffect } from "react";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { passwordLoading, passwordSuccess, passwordError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  useEffect(() => {
    if (passwordSuccess) {
      toast.success(passwordSuccess);
      setFormData({ old_password: "", new_password: "", new_password_confirm: "" });
      dispatch(resetPasswordState());
    }
    if (passwordError) {
      const msg = typeof passwordError === 'string' ? passwordError : JSON.stringify(passwordError);
      toast.error(msg);
    }
  }, [passwordSuccess, passwordError, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.new_password_confirm) {
      toast.error("New passwords do not match");
      return;
    }
    dispatch(changePassword(formData));
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold text-emerald-600 mb-4">Change Password</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Current Password</label>
          <input
            type="password"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/70 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">New Password</label>
          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/70 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="new_password_confirm"
            value={formData.new_password_confirm}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/70 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={passwordLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {passwordLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;