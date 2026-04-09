import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchUsers,deactivateUser,fetchInvitations,createInvitation,cancelInvitation,} from "@/store/slices/usersSlice";
import toast from "react-hot-toast";
import { companyInvitationsAPI } from "@/api/api";
import {Users,Mail,Shield,Search,X,Send,Clock,Loader2,AlertTriangle,Crown,Building2,} from "lucide-react";

//Role Config 
const ROLE_CONFIG = {
  platform_admin: {
    label: "Platform Admin",
    icon: Crown,
    light: "bg-purple-100 text-purple-700 border-purple-200",
    dark: "dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/50",
    dot: "bg-purple-500",
  },
  admin: {
    label: "Company Admin",
    icon: Shield,
    light: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dark: "dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700/50",
    dot: "bg-indigo-500",
  },
};

//Sub-Components
const Avatar = ({ name, size = "md" }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.light} ${config.dark} transition-colors`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-4">
    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="h-3 w-52 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
    <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
  </div>
);

//  Main Component
const PlatformDashboard = () => {
  const dispatch = useDispatch();
  const { users, invitations, isLoading } = useSelector((s) => s.users);
  const { user } = useSelector((s) => s.auth);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [search, setSearch] = useState("");
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchInvitations());
  }, [dispatch]);

  if (!user || user.role !== "platform_admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Access denied. Platform admins only.
        </div>
      </div>
    );
  }

  //  Only show Company Admins
  const admins = useMemo(() => (users || []).filter((u) => u.role === "admin"), [users]);
  
  const filteredAdmins = useMemo(() => {
    if (!search) return admins;
    const q = search.toLowerCase();
    return admins.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  //Handlers
 const handleInvite = async (e) => {
  e.preventDefault();

  if (!inviteEmail) {
    return toast.error("Email is required");
  }

  try {
    await companyInvitationsAPI.create({
      email: inviteEmail,
      company_name: "New Company", // or input field if you want
      message: inviteMessage,
    });

    toast.success("Company Admin invitation sent");

    setShowInviteForm(false);
    setInviteEmail("");
    setInviteMessage("");
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to send invitation");
  }
};

  const handleDeactivate = async (id) => {
    setDeactivatingId(id);
    const result = await dispatch(deactivateUser(id));
    setDeactivatingId(null);
    toast[deactivateUser.fulfilled.match(result) ? "success" : "error"](
      deactivateUser.fulfilled.match(result) ? "Admin deactivated" : "Failed to deactivate"
    );
  };

  const handleCancelInvitation = async (id) => {
    const result = await dispatch(cancelInvitation(id));
    toast[cancelInvitation.fulfilled.match(result) ? "success" : "error"](
      cancelInvitation.fulfilled.match(result) ? "Invitation cancelled" : "Failed to cancel"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-500" />
              Platform Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Oversee the entire system and manage Company Admins
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              showInviteForm
                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {showInviteForm ? <X className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {showInviteForm ? "Close Form" : "Invite Company Admin"}
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{admins.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Company Admins</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{admins.filter(u => u.is_active).length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Admins</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{invitations?.length || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending Invites</p>
            </div>
          </div>
        </div>

        {/* INLINE INVITE FORM (NO MODAL) */}
        {showInviteForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 shadow-sm p-6 animate-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">New Company Admin</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This user will automatically be granted Company Admin privileges.
                </p>
              </div>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Send Invite
                </button>
              </div>
              <input
                type="text"
                placeholder="Add a personal message (optional)"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
              />
            </form>
          </div>
        )}

        {/* ADMINS TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search company admins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
            ) : filteredAdmins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <Users className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No company admins found</p>
              </div>
            ) : (
              filteredAdmins.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={`${u.first_name || ""} ${u.last_name || ""}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={u.role} />
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      disabled={deactivatingId === u.id}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all disabled:opacity-50"
                    >
                      {deactivatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                      Deactivate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* PENDING INVITATIONS */}
        {invitations?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Admin Invitations</h2>
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{invitations.length}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{inv.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "recently"}</p>
                    </div>
                  </div>
                  <button onClick={() => handleCancelInvitation(inv.id)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformDashboard;