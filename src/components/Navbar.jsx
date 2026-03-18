import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/slices/authslice";
import { Link, useNavigate } from "react-router-dom";
import {  useEffect, useState } from "react";
import portrait from "@/assets/portrait.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ first_name: "",last_name: "", email: "", phone: "" });
  const { token } = useSelector((state) => state.auth);
  // const { profile, loading, updateLoading, updateError } = useSelector(
  //   (state) => state.profile
  // );
  const [imagePreview, setImagePreview] = useState(portrait);
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };
 const {profile} = useSelector((state) => state)
  return (
    <header
      className="fixed top-0 left-64 right-0 h-16
      bg-white/80 backdrop-blur border-b border-gray-200
      flex items-center justify-between
      px-8 z-40"
    >
      <h1 className="text-xl font-bold text-emerald-600">
        PrintFlow
      </h1>

      {token && (
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Logout
        </button>
      )}
      <Link to='/profile'>
          <img
            src={portrait}
            alt={"Profile"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow  cursor-pointer"
            onClick={() => editing && document.getElementById("avatarInput").click()}
          /></Link>
    </header>
  );
};

export default Navbar;