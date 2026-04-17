import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData, changePassword } from "@/store/slices/profileSlice";
import toast from "react-hot-toast";
import { User, Lock, Save, Shield, Palette, Printer, Mail, Calendar, Check } from "lucide-react";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfileData(profileForm));
    if (updateProfileData.fulfilled.match(result)) {
      toast.success("Profile updated!");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } else {
      toast.error(result.payload || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const result = await dispatch(changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
      new_password_confirm: passwordForm.new_password_confirm,
    }));

    if (changePassword.fulfilled.match(result)) {
      toast.success("Password changed!");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
      setPasswordForm({ old_password: "", new_password: "", new_password_confirm: "" });
    } else {
      toast.error(result.payload || "Failed to change password");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return <Shield className="w-4 h-4" />;
      case "designer":
        return <Palette className="w-4 h-4" />;
      case "printer":
        return <Printer className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40";
      case "designer":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200/60 dark:border-pink-800/40";
      case "printer":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/40";
      default:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40";
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all";

  const labelClass =
    "block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2";

  const initials =
    user?.first_name?.[0]?.toUpperCase() &&
    user?.last_name?.[0]?.toUpperCase()
      ? `${user.first_name[0]}${user.last_name[0]}`
      : user?.email?.[0]?.toUpperCase() || "?";

  const memberSince = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Profile
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
            Manage your account settings
          </p>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
        {/* Banner */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-br from-[#c2410c] via-[#ea580c] to-[#f97316] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Avatar + Info */}
        <div className="relative px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] border-4 border-white dark:border-stone-900 flex items-center justify-center shadow-lg shadow-orange-600/20 dark:shadow-orange-900/30">
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-stone-900" />
                </span>
              </div>
            </div>

            {/* Name & Role */}
            <div className="flex-1 min-w-0 sm:pb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">
                {user?.first_name} {user?.last_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getRoleColor(
                    user?.role
                  )}`}
                >
                  {getRoleIcon(user?.role)}
                  <span className="capitalize">
                    {user?.role?.replace("_", " ")}
                  </span>
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#c2410c]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[#c2410c]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 truncate">
                  {profileForm.phone || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Personal Info - wider */}
        <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100 dark:border-stone-800">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-20 dark:opacity-10 scale-110" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/15 dark:shadow-orange-600/10">
                <User className="w-[18px] h-[18px] text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Personal Information
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                Update your name and phone number
              </p>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, first_name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, last_name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                placeholder="+254 700 000 000"
                className={inputClass}
              />
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  profileSaved
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white shadow-lg shadow-orange-600/20 dark:shadow-orange-900/30 hover:shadow-orange-600/30"
                }`}
              >
                {profileSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300 flex flex-col">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100 dark:border-stone-800">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-20 dark:opacity-10 scale-110" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/15 dark:shadow-orange-600/10">
                <Lock className="w-[18px] h-[18px] text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Password
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                Change your password
              </p>
            </div>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handlePasswordSubmit}
            className="p-6 space-y-5 flex-1 flex flex-col"
          >
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    old_password: e.target.value,
                  })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                placeholder="Min. 8 characters"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                value={passwordForm.new_password_confirm}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password_confirm: e.target.value,
                  })
                }
                placeholder="Re-enter new password"
                className={inputClass}
                required
              />
            </div>

            {/* Password hint */}
            <div className="flex items-start gap-2.5 px-3.5 py-3 bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/10 dark:border-[#c2410c]/15 rounded-xl">
              <Shield className="w-4 h-4 text-[#c2410c] shrink-0 mt-0.5" />
              <p className="text-xs text-[#c2410c] dark:text-orange-400/80 font-medium leading-relaxed">
                Use at least 8 characters with a mix of letters, numbers &
                symbols for a strong password.
              </p>
            </div>

            {/* Spacer to push button down */}
            <div className="flex-1" />

            {/* Action */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  passwordSaved
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white shadow-sm transition-colors"
                }`}
              >
                {passwordSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Password Updated!
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {isLoading ? "Updating..." : "Change Password"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;