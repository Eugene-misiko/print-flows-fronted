import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/slices/authslice";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      className="fixed top-0 left-64 right-0 h-16
      bg-white border-b border-gray-200
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
    </header>
  );
};

export default Navbar;