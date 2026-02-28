import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const { user } = useSelector((state) => state.auth);
  return (
    <>
      <div className="lg:hidden p-4">
        <button
          onClick={() => setOpen(!open)}
          className="bg-zinc-800 text-white px-4 py-2 rounded-md">
          Filters
        </button>
      </div>

      <aside className={`bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 text-black dark:text-white p-6 space-y-6
        ${open ? "block" : "hidden"} lg:block w-64`}>
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <Separator className="bg-zinc-800" />
        {user?.role.toLowerCase() ==="client" && (
          <>
        <Link to="/profile">My profile</Link>
        <p className="cursor-pointer">My orders</p>
        <p className="cursor-pointer">Create Orders</p>
        <p className="cursor-pointer">Notifications</p>
        <p className="cursor-pointer">Make Payment</p>
        <p className="cursor-pointer">Deliveries</p>
        <p className="cursor-pointer">Open chats</p>
        </> )}
        {user?.role.toLowerCase() ==="admin" && (
          <>
        <p className="cursor-pointer">Orders</p>
        <p className="cursor-pointer">Payments</p>
        <p className="cursor-pointer">Notifications</p>
        <p className="cursor-pointer">Users</p> 
        <p className="cursor-pointer">Design Requests</p> 
         <p className="cursor-pointer">Open chats</p> 
         <p className="cursor-pointer">Make Deliveries</p> 
         </> )}
        {user?.role.toLowerCase() ==="designer" && (
          <>
        <p className="cursor-pointer">Designes</p>
        <p className="cursor-pointer">Notifications</p>
        <p className="cursor-pointer">Open chats</p> 
         
         </> )}
      </aside>
    </>
  )
}