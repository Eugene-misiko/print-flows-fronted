import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/slices/authslice"
import { Link, useNavigate } from "react-router-dom"
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
    <header className="w-full border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="text-xl font-bold tracking-wider">
          PrintFlow
        </div>
        <div className="flex items-center gap-6 text-sm">
          <ThemeToggle />
          {token ? (
            <Button
              onClick={handleLogout}
              className="bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer">
              Logout
            </Button>
          ) : (
            <>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar