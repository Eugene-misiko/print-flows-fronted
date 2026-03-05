import { Separator } from "./ui/separator";
import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);

  const linkStyle =
    "block px-4 py-2 rounded-lg text-sm font-medium transition";
  const activeStyle =
    "bg-rose-100 text-rose-700 font-semibold";

  return (
    <>
      <div className="lg:hidden p-4">
        <button
          onClick={() => setOpen(!open)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md transition"
        >
          Menu
        </button>
      </div>
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64
        bg-white border-r border-gray-200
        p-6 space-y-6
        ${open ? "block" : "hidden"} lg:block`}
      >
        <h2 className="text-xl font-bold text-rose-600">
          Dashboard
        </h2>

        <Separator />

        <nav className="space-y-2">
          {user?.role?.toLowerCase() === "printer" && (
            <>
              <NavLink
                to="/printer"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                Printer Dashboard
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                My Profile
              </NavLink>
            </>
          )}
          {user?.role?.toLowerCase() === "client" && (
            <>
              <NavLink
                to="/authen"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                Back to Home
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                My Profile
              </NavLink>

              <NavLink
                to="/create-order"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                Create Order
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                My Orders
              </NavLink>
            </>
          )}
          {user?.role?.toLowerCase() === "admin" && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                Users
              </NavLink>
            </>
          )}
          {user?.role?.toLowerCase() === "designer" && (
            <>
              <NavLink
                to="/designer"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
                }
              >
                Assigned Designs
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? activeStyle
                      : "hover:bg-rose-50 text-gray-700"
                  }`
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