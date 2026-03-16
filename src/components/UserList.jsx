import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, assignRole } from "@/slices/userListSlice";

const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const roleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "designer":
        return "bg-blue-100 text-blue-700";
      case "printer":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-emerald-100 text-emerald-700";
    }
  };

  return (
    <div className="ml-15 p-8 min-h-screen dark:bg-zinc-900 transition-colors">

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-bold mb-6 text-emerald-600">
          User Management
        </h2>

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400">
            Loading users...
          </p>
        )}

        {error && (
          <p className="text-red-500 mb-4">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </p>
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="text-left text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Assign Role</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="
                    border-b border-zinc-100 dark:border-zinc-800
                    hover:bg-zinc-50 dark:hover:bg-zinc-800
                    transition
                    "
                  >

                    <td className="px-4 py-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {user.first_name}
                    </td>

                    <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
                      {user.email}
                    </td>

                    <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
                      {user.phone}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full capitalize ${roleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">

                      <select
                        value={user.role}
                        onChange={(e) =>
                          dispatch(
                            assignRole({
                              userId: user.id,
                              role: e.target.value,
                            })
                          )
                        }
                        className="
                        px-3 py-2
                        rounded-md
                        text-sm
                        border border-zinc-300 dark:border-zinc-700
                        bg-white dark:bg-zinc-900
                        text-zinc-700 dark:text-zinc-200
                        focus:outline-none
                        focus:ring-2 focus:ring-emerald-500
                        "
                      >
                        <option value="client">Client</option>
                        <option value="designer">Designer</option>
                        <option value="admin">Admin</option>
                        <option value="printer">Printer</option>
                      </select>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

        {!loading && users.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">
            No users available.
          </p>
        )}

      </div>
    </div>
  );
};

export default UserList;