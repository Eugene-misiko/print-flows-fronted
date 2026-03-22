import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MoreVertical,
  Shield,
  Palette,
  Printer,
  User,
  Trash2,
  Edit,
  XCircle,
} from "lucide-react";
import { fetchUsers, inviteUser, deleteUser, fetchInvitations, cancelInvitation } from "../store/slices/usersSlice";
import toast from "react-hot-toast";

const UsersList = () => {
  const dispatch = useDispatch();
  const { users, invitations, isLoading } = useSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", role: "CLIENT" });
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ search: searchTerm, role: roleFilter }));
    dispatch(fetchInvitations());
  }, [dispatch, searchTerm, roleFilter]);

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "DESIGNER":
        return <Palette className="h-4 w-4 text-pink-600" />;
      case "PRINTER":
        return <Printer className="h-4 w-4 text-cyan-600" />;
      default:
        return <User className="h-4 w-4 text-orange-600" />;
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "bg-purple-100 text-purple-700",
      DESIGNER: "bg-pink-100 text-pink-700",
      PRINTER: "bg-cyan-100 text-cyan-700",
      CLIENT: "bg-orange-100 text-orange-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const handleInvite = async () => {
    if (!inviteData.email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);
    try {
      await dispatch(inviteUser(inviteData)).unwrap();
      toast.success("Invitation sent successfully!");
      setShowInviteModal(false);
      setInviteData({ email: "", role: "CLIENT" });
      dispatch(fetchInvitations());
    } catch (error) {
      toast.error(error || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete user");
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) return;

    try {
      await dispatch(cancelInvitation(invitationId)).unwrap();
      toast.success("Invitation cancelled");
    } catch (error) {
      toast.error(error || "Failed to cancel invitation");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage team members and clients</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DESIGNER">Designer</option>
            <option value="PRINTER">Printer</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{invitation.email}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                    {invitation.role}
                  </span>
                </div>
                <button
                  onClick={() => handleCancelInvitation(invitation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-medium">
                            {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="CLIENT">Client</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="PRINTER">Printer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={isInviting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
