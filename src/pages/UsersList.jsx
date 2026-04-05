import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchUsers,deactivateUser,changeUserRole,fetchInvitations,createInvitation,cancelInvitation,} from "@/store/slices/usersSlice";
import toast from "react-hot-toast";
import {UserPlus,Mail,Shield,Palette,Printer,User,Search,X,ChevronDown,AlertTriangle,Users, Send, Clock,Sparkles,Loader2,} from "lucide-react";

// Role Config (Company Level Only) 
const ROLE_CONFIG = {
  designer: {
    label: "Designer",
    icon: Palette,
    light: "bg-pink-100 text-pink-700 border-pink-200",
    dark: "dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700/50",
    dot: "bg-pink-500",
  },
  printer: {
    label: "Printer",
    icon: Printer,
    light: "bg-amber-100 text-amber-700 border-amber-200",
    dark: "dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/50",
    dot: "bg-amber-500",
  },
  client: {
    label: "Client",
    icon: User,
    light: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dark: "dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50",
    dot: "bg-emerald-500",
  },
};

const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.client;

//  Skeleton 
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-4">
    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="h-3 w-52 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
    <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
  </div>
);

//  Avatar
const Avatar = ({ name, size = "md" }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-semibold shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
};

//Role badge
const RoleBadge = ({ role }) => {
  const config = getRoleConfig(role);
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.light} ${config.dark} transition-colors`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Stat Card 
function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-lg shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

//Filter Pill
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
        active
          ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-600 dark:hover:text-orange-400"
      }`}
    >
      {children}
    </button>
  );
}

//main component
const UsersList = () => {
  const dispatch = useDispatch();
  const { users, invitations, isLoading } = useSelector((s) => s.users);
  const { user: currentUser } = useSelector((s) => s.auth);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "", message: "" });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchInvitations());
  }, [dispatch]);

  const isCompanyAdmin = currentUser?.role === "admin";

  const roleOptions = [
    { value: "designer", label: "Designer" },
    { value: "printer", label: "Printer" },
    { value: "client", label: "Client" },
  ];

  // FILTERING: Hide Platform Admins & Other Company Admins
  const filteredUsers = useMemo(() => {
    let list = (users || []).filter((u) => !["platform_admin", "admin"].includes(u.role));
    
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") {
      list = list.filter((u) => u.role === filterRole);
    }
    return list;
  }, [users, search, filterRole]);

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(filteredUsers.map((u) => u.role))];
    return roles.map((r) => ({ value: r, label: getRoleConfig(r).label }));
  }, [filteredUsers]);

 //Headers
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email) return toast.error("Email is required");
    if (!inviteForm.role) return toast.error("Select a role");

    const result = await dispatch(createInvitation(inviteForm));
    if (createInvitation.fulfilled.match(result)) {
      toast.success("Invitation sent successfully");
      setShowInviteModal(false);
      setInviteForm({ email: "", role: "", message: "" });
    } else {
      toast.error(result.payload || "Failed to send invitation");
    }
  };

  const handleDeactivate = async (id) => {
    setDeactivatingId(id);
    const result = await dispatch(deactivateUser(id));
    setDeactivatingId(null);
    toast[deactivateUser.fulfilled.match(result) ? "success" : "error"](
      deactivateUser.fulfilled.match(result) ? "User deactivated" : "Failed to deactivate user"
    );
  };

  const handleRoleChange = async (id, role) => {
    const result = await dispatch(changeUserRole({ id, role }));
    if (changeUserRole.fulfilled.match(result)) {
      toast.success("Role updated");
    }
  };

  const handleCancelInvitation = async (id) => {
    const result = await dispatch(cancelInvitation(id));
    toast[cancelInvitation.fulfilled.match(result) ? "success" : "error"](
      cancelInvitation.fulfilled.match(result) ? "Invitation cancelled" : "Failed to cancel"
    );
  };

  // Render 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-500" />
              Team Members
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your company's team members and invitations
            </p>
          </div>

          {isCompanyAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Invite Team Member
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Team" value={filteredUsers.length} accent="from-blue-500 to-indigo-600" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Invites" value={invitations?.length || 0} accent="from-amber-500 to-orange-600" />
          <StatCard icon={<Sparkles className="w-5 h-5" />} label="Active Roles" value={uniqueRoles.length} accent="from-emerald-500 to-teal-600" />
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || filterRole !== "all"
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750"
              }`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
              Filter by Role
            </button>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 flex flex-wrap gap-2 animate-in">
              <FilterPill active={filterRole === "all"} onClick={() => setFilterRole("all")}>All</FilterPill>
              {uniqueRoles.map((r) => (
                <FilterPill key={r.value} active={filterRole === r.value} onClick={() => setFilterRole(r.value)}>{r.label}</FilterPill>
              ))}
            </div>
          )}
        </div>

        {/* USERS TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">User</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <Users className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No team members found</p>
                <p className="text-xs mt-1">
                  {search || filterRole !== "all" ? "Try adjusting your search or filters" : "Invite your first team member to get started"}
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <div key={u.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150 group">
                    
                    <div className="sm:col-span-5 flex items-center gap-3">
                      <Avatar name={`${u.first_name || ""} ${u.last_name || ""}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {u.first_name} {u.last_name}
                          {isSelf && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">YOU</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex items-center">
                      <RoleBadge role={u.role} />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
                        <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-gray-300 dark:bg-gray-600"}`} />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-2">
                      {isCompanyAdmin && !isSelf ? (
                        <>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                          >
                            {roleOptions.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleDeactivate(u.id)}
                            disabled={deactivatingId === u.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                          >
                            {deactivatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                            Deactivate
                          </button>
                        </>
                      ) : isSelf ? (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">Current account</span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!isLoading && filteredUsers.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredUsers.length} team members
            </div>
          )}
        </div>

        {/* PENDING INVITATIONS */}
        {invitations?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Invitations</h2>
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
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {inv.role && getRoleConfig(inv.role).label} • Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "recently"}
                      </p>
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

      {/* INVITE MODAL (Company Admin Only) */}
    
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-modal-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Invite Team Member</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add a Designer, Printer, or Client</p>
                </div>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.75rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.25rem 1.25rem",
                  }}
                >
                  <option value="">Select a role</option>
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Message <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a personal note to the invitation..."
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;