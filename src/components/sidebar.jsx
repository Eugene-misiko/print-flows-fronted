import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.toLowerCase();

  const linkClass = "block px-4 py-2 rounded-lg text-sm transition";
  const activeClass = "bg-emerald-600 text-white";

  const menuConfig = {
    client: [
      { name: "Dashboard", path: "/authen" },
      { name: "Create Order", path: "/create-order" },
      { name: "My Orders", path: "/history" },
      { name: "Products", path: "/products" },
      { name: "Profile", path: "/profile" },
    ],

    designer: [
      { name: "Design Requests", path: "/designer" },
      { name: "Profile", path: "/profile" },
    ],

    printer: [
      { name: "Print Queue", path: "/printer" },
      { name: "Profile", path: "/profile" },
    ],

    admin: [
      { name: "Dashboard", path: "/authen" },
      { name: "Users", path: "/users" },
      { name: "Products", path: "/products" },
      { name: "Add Product", path: "/products/new" },
      { name: "Print Queue", path: "/printer" },
      { name: "Profile", path: "/profile" },
    ],
  };

  const links = menuConfig[role] || [];

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-slate-900 text-gray-300 flex flex-col">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">PrintFlow</h2>
        <p className="text-sm text-gray-400 mt-1">
          Welcome {user?.first_name}
        </p>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-xs uppercase text-gray-500 mb-3">Menu</p>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `${linkClass} ${
                  isActive ? activeClass : "hover:bg-slate-800"
                }`
              }>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}