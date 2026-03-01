import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);

  const linkStyle =
    "block px-3 py-2 rounded-md text-sm font-medium transition";

  const activeStyle =
    "bg-zinc-200 dark:bg-zinc-800 font-semibold";

  return (
    <>
      <div className="lg:hidden p-4">
        <button
          onClick={() => setOpen(!open)}
          className="bg-zinc-800 text-white px-4 py-2 rounded-md">
          Menu
        </button>
      </div>
      <aside className={`bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 
        text-black dark:text-white p-6 space-y-6
        ${open ? "block" : "hidden"} lg:block w-64`}>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <Separator />
        <nav className="space-y-1">
          {user?.role?.toLowerCase() === "client" && (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                My Profile
              </NavLink>
              <NavLink
                to="/client-orders"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                My Orders
              </NavLink>
              <NavLink
                to="/create-order"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                Create Order
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                    Order History
              </NavLink>
              </>
          )}
          {user?.role?.toLowerCase() === "admin" && (
            <>
              <NavLink
                to="/admin-orders"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                Orders
              </NavLink>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                  Users
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                My Profile
              </NavLink>
            </>
          )}
          {user?.role?.toLowerCase() === "designer" && (
            <>
              <NavLink
                to="/designer-orders"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`}>
                Assigned Designs
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : ""}`
                }
              >
                My Profile
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}