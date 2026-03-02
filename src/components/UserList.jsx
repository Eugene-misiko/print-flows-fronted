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
    <div className="p-6">
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-md p-6 transition-colors duration-300">
        <h2 className=" text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          Users
        </h2>
        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400">
            Loading users...
          </p>
        )}

        {error && (
          <p className="text-red-500 mb-4">
            {typeof error === "string"
              ? error
              : JSON.stringify(error)}
          </p>
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-zinc-500 dark:text-zinc-400 uppercase  text-xs tracking-wide">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Assign</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}
                    className="bg-gray-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition rounded-lg ">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 rounded-l-lg">
                      {user.username}
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {user.phone}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 rounded-r-lg">
                      {user.role}
                    </td>
                                        <td className="px-4 py-3 ">
                    <select
                        value={user.role}
                        onChange={(e) =>
                        dispatch(assignRole({ userId: user.id, role: e.target.value }))
                        }
                        className=" dark:bg-zinc-950
                                 dark:text-zinc-200
                                px-2 py-1 rounded-md text-sm ">
                        <option value="client">Client</option>
                        <option value="designer">Designer</option>
                        <option value="admin">Admin</option>
                    </select>
                    </td>
                  </tr>
                ))}


              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserList;