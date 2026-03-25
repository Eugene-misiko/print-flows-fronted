import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex dark:text-black min-h-screen dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
