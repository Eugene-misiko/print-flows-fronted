import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.toLowerCase();

  const linkClass = "block px-4 py-2 rounded-lg text-sm transition";
  const activeClass = "bg-emerald-600 text-white";

  return (
    <aside
      className="fixed top-0 left-0 w-64 h-screen bg-slate-900 text-gray-300 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">
          ClientHub
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Welcome {user?.first_name}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-xs uppercase text-gray-500 mb-3">
          Menu
        </p>
        {role === "client" && (
          <nav className="space-y-1">
            <NavLink
              to="/authen"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Dashboard
            </NavLink>
            <NavLink
              to="/create-order"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Create Order
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Orders
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              My Profile
            </NavLink>
          </nav>
        )}
        {role === "admin" && (
          <nav className="space-y-1">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Admin Dashboard
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              User Management
            </NavLink>
            <NavLink
              to="/authen"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Products
            </NavLink>
          </nav>
        )}
        {role === "designer" && (
          <nav className="space-y-1">
            <NavLink
              to="/designer"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Design Requests
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              My Profile
            </NavLink>            
          </nav>
        )}
        {role === "printer" && (
          <nav className="space-y-1">
            <NavLink
              to="/printer"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : "hover:bg-slate-800"}`}>
              Print Queue
            </NavLink>
          </nav>
        )}
      </div>
    </aside>);
    }