import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, assignRole } from "@/slices/userListSlice";

const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="ml-64 p-8 min-h-screen  dark:bg-zinc-900 transition-colors">

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-lg p-8 transition-colors duration-300">

        <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">
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

            <table className="w-full border-separate border-spacing-y-3 text-sm">

              <thead>
                <tr className="text-left text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Assign Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-gray-50 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-700 transition rounded-xl shadow-sm"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 rounded-l-xl">
                      {user.username}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {user.phone}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      <span className="px-3 py-1 text-xs rounded-full bg-rose-100 text-rose-600 capitalize">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3 rounded-r-xl">
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
                        className="bg-rose-50 text-rose-700
                                   dark:bg-zinc-900 dark:text-zinc-200
                                   px-3 py-2 rounded-md text-sm
                                   border border-rose-200
                                   focus:outline-none focus:ring-2 focus:ring-rose-400"
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