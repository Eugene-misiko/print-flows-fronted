import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/slices/authslice";
import { fetchProfile } from "@/slices/profileSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";


const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.profile);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (token) dispatch(fetchProfile());
  }, [dispatch, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login");
  };
  // Generate initials if no avatar
  const getInitials = () => {
    if (!profile?.first_name) return "U";
    return profile.first_name.charAt(0).toUpperCase();
  };
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-8 z-40 dark:bg-zinc-400/10">
      {/* LOGO */}
      <h1 className="text-xl font-bold text-emerald-600 tracking-wide">
        PrintFlow
      </h1>

      {/* RIGHT SIDE */}
      {token && (
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <NotificationBell />
          <ThemeToggle />

          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {profile?.first_name || "User"}
            </p>
            <p className="text-xs text-gray-400">
              {profile?.email}
            </p>
          </div>

          {/* AVATAR */}
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative cursor-pointer"
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow dark:border-zinc-700"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
                {getInitials()}
              </div>
            )}
            {/* ONLINE DOT */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-zinc-800"></span>
          </div>

          {/* DROPDOWN */}
          <div
            className={`absolute right-0 top-14 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 transition-all duration-200 dark:bg-zinc-900 dark:border-zinc-700 origin-top-right ${
              dropdownOpen
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none"
            }`}
          >
            {/* USER INFO */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-700">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {profile?.first_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.email}
              </p>
            </div>

            {/* ACTIONS CONTAINER */}
            <div className="p-2 space-y-1">
              {/* MY PROFILE BUTTON */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-150 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
              {/* LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;