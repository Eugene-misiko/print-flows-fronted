import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950">

      {token && <Sidebar />}

      <Navbar />

      <main className="ml-64 pt-16 p-8">
        <Outlet />
      </main>

    </div>
  );
}