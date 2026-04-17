import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deactivateUser, fetchInvitations, cancelInvitation } from "@/store/slices/usersSlice";
import toast from "react-hot-toast";
import { companyInvitationsAPI } from "@/api/api";
import { Users, Mail, Shield, Search, X, Send, Clock, Loader2, AlertTriangle, Crown, Building2 } from "lucide-react";

const ROLE_CONFIG = {
  platform_admin: {
    label: "Platform Admin",
    icon: Crown,
    cls: "bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/40",
    dot: "bg-purple-500",
  },
  admin: {
    label: "Company Admin",
    icon: Shield,
    cls: "bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40",
    dot: "bg-indigo-500",
  },
};

const Avatar = ({ name, size = "md" }) => {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const sizes = { sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-purple-500/15`}>
      {initials}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${config.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4">
    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
      <div className="h-3 w-48 rounded bg-stone-50 dark:bg-stone-800/60 animate-pulse" />
    </div>
    <div className="h-7 w-20 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
  </div>
);

const StatCard = ({ icon: Icon, value, label, gradient, shadowColor }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 transition-colors duration-300">
    <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg ${shadowColor} shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">{value}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/40 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5" />
          Access denied. Platform admins only.
        </div>
      </div>
    );
  }

  const admins = useMemo(() => (users || []).filter((u) => u.role === "admin"), [users]);
  const filteredAdmins = useMemo(() => {
    if (!search) return admins;
    const q = search.toLowerCase();
    return admins.filter((u) => u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [admins, search]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error("Email is required");
    try {
      await companyInvitationsAPI.create({ email: inviteEmail, company_name: "New Company", message: inviteMessage });
      toast.success("Invitation sent");
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
    toast[deactivateUser.fulfilled.match(result) ? "success" : "error"](deactivateUser.fulfilled.match(result) ? "Admin deactivated" : "Failed to deactivate");
  };

  const handleCancelInvitation = async (id) => {
    const result = await dispatch(cancelInvitation(id));
    toast[cancelInvitation.fulfilled.match(result) ? "success" : "error"](cancelInvitation.fulfilled.match(result) ? "Invitation cancelled" : "Failed to cancel");
  };

  const inputCls = "w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/10 transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            Platform Dashboard
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">Manage company admins and invitations</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
            showInviteForm
              ? "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
          }`}
        >
          {showInviteForm ? <X className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {showInviteForm ? "Close" : "Invite Admin"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Building2} value={admins.length} label="Company Admins" gradient="bg-gradient-to-br from-indigo-500 to-purple-600" shadowColor="shadow-indigo-500/20" />
        <StatCard icon={Users} value={admins.filter((u) => u.is_active).length} label="Active Admins" gradient="bg-gradient-to-br from-emerald-500 to-teal-600" shadowColor="shadow-emerald-500/20" />
        <StatCard icon={Clock} value={invitations?.length || 0} label="Pending Invites" gradient="bg-gradient-to-br from-amber-500 to-orange-600" shadowColor="shadow-amber-500/20" />
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/50 overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-purple-50/50 dark:bg-purple-900/10">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              Invite Company Admin
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 ml-[42px]">They'll receive an email to set up their company</p>
          </div>
          <form onSubmit={handleInvite} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="email" required placeholder="admin@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className={inputCls + " pl-10"} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Personal Message <span className="font-normal text-stone-300 dark:text-stone-600">optional</span></label>
              <input type="text" placeholder="Add a note to the invitation..." value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} className={inputCls} />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] transition-all">
                <Send className="w-4 h-4 inline mr-1.5 -mt-0.5" />Send Invite
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col overflow-hidden transition-colors duration-300">
        {/* Search header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Company Admins</h2>
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">{filteredAdmins.length} result{filteredAdmins.length !== 1 && "s"}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={inputCls + " pl-10 pr-10"}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
          {isLoading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{search ? "No admins match your search" : "No company admins yet"}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{search ? "Try a different search term" : "Invite your first admin to get started"}</p>
            </div>
          ) : (
            filteredAdmins.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={`${u.first_name || ""} ${u.last_name || ""}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{u.first_name} {u.last_name}</p>
                      {!u.is_active && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <RoleBadge role={u.role} />
                  <button
                    onClick={() => handleDeactivate(u.id)}
                    disabled={deactivatingId === u.id || !u.is_active}
                    className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 border border-transparent hover:border-red-200/60 dark:hover:border-red-800/40 transition-all disabled:opacity-0 disabled:pointer-events-none"
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

      {/* Pending Invitations */}
      {invitations?.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Pending Invitations</h2>
            <span className="ml-auto px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 tabular-nums">
              {invitations.length}
            </span>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{inv.email}</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                      Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "recently"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelInvitation(inv.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 border border-transparent hover:border-red-200/60 dark:hover:border-red-800/40 transition-all"
                >
                  <X className="w-3 h-3" />Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformDashboard;