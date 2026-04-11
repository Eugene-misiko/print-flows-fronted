import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";

const Layout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;