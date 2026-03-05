import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/slices/authslice"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import ThemeToggle from "./ThemeToggle"

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 
      border-b border-rose-100
      bg-white/90 backdrop-blur-md
      dark:bg-zinc-950/90
      transition">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="text-2xl font-bold tracking-wide text-rose-600">
          PrintFlow
        </div>
        <div className="flex items-center gap-6 text-sm">

          <ThemeToggle />

          {token && (
            <Button
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
            >
              Logout
            </Button>
          )}

        </div>
      </div>
    </header>
  )
}

export default Navbar