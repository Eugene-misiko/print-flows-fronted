import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import { useSelector } from "react-redux"


export default function Layout() {
  const { token } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-zinc-100
     dark:bg-zinc-950 text-black dark:text-white
     transition-colors duration-300">
      <Navbar />

      <div className="flex">
        {token && <Sidebar />}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}