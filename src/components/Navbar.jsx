import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/slices/authslice";
import { fetchProfile } from "@/slices/profileSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import portrait from "@/assets/portrait.png";

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
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-8 z-40">
      {/* LOGO */}
      <h1 className="text-xl font-bold text-emerald-600 tracking-wide">
        PrintFlow
      </h1>
      {/* RIGHT SIDE */}
      {token && (
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          {/* USER NAME (optional nice touch) */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-700">
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
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
                {getInitials()}
              </div>
            )}
            {/* ONLINE DOT */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          {/* DROPDOWN */}
          <div
            className={`absolute right-0 top-14 w-52 bg-white border rounded-xl shadow-lg py-2 transition-all duration-200 origin-top-right ${
              dropdownOpen
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none"
            }`}
          >
            {/* USER INFO */}
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-semibold">
                {profile?.first_name}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.email}
              </p>
            </div>

            {/* ACTIONS */}
            <button
              onClick={() => {
                navigate("/profile");
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
            >
              My Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition">
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;