import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";

const Layout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gradient-to-r dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
      <MobileSidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;