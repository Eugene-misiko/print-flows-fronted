import { useSelector } from "react-redux"
import Navbar from "./Navbar"
import Sidebar from "./sidebar"
import { Outlet } from "react-router-dom"
export default function Layout() {
  const { token } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-black dark:text-white transition-colors">

      <Navbar />

      <div className="flex flex-1">
        {token && <Sidebar />}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}