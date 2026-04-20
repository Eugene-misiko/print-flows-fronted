import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deactivateUser,
  fetchInvitations,
  cancelInvitation,
} from "@/store/slices/usersSlice";
import toast from "react-hot-toast";
import { companyInvitationsAPI } from "@/api/api";
import {
  Users,
  Mail,
  Shield,
  Search,
  X,
  Send,
  Clock,
  Loader2,
  AlertTriangle,
  Crown,
  Building2,
  Lock,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Role Config
   ═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   Shared Classes
   ═══════════════════════════════════════════ */
const inputClass =
  "w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-purple-400/10 focus:border-purple-400/50 outline-none transition-all";

const labelClass =
  "block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2";

/* ═══════════════════════════════════════════
   Avatar
   ═══════════════════════════════════════════ */
const Avatar = ({ name, size = "md" }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  const sizes = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-11 h-11 text-sm",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-purple-500/15`}
    >
      {initials}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Role Badge
   ═══════════════════════════════════════════ */
const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all duration-200 ${config.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/* ═══════════════════════════════════════════
   Skeleton Row
   ═══════════════════════════════════════════ */
const SkeletonRow = ({ index }) => (
  <div
    className="flex items-center gap-4 px-6 py-4"
    style={{
      opacity: 0,
      animation: `skeletonIn 0.4s ${index * 60}ms ease-out forwards`,
    }}
  >
    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse" />
    <div className="flex-1 space-y-2.5">
      <div className="h-4 w-32 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
      <div className="h-3 w-48 rounded-lg bg-stone-50 dark:bg-stone-800/60 animate-pulse" />
    </div>
    <div className="h-7 w-24 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
    <div className="h-8 w-20 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
  </div>
);

/* ═══════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════ */
const StatCard = ({
  icon: Icon,
  value,
  label,
  gradient,
  shadowColor,
  delay = 0,
}) => (
  <div
    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    style={{
      opacity: 0,
      transform: "translateY(12px)",
      animation: `fadeUp 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards`,
    }}
  >
    <div
      className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg ${shadowColor} shrink-0`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums tracking-tight">
        {value}
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   Admin Row
   ═══════════════════════════════════════════ */
const AdminRow = ({
  u,
  deactivatingId,
  handleDeactivate,
  index,
}) => (
  <div
    key={u.id}
    className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-all duration-200 group"
    style={{
      opacity: 0,
      transform: "translateY(8px)",
      animation: `rowIn 0.4s ${index * 40}ms cubic-bezier(0.16,1,0.3,1) forwards`,
    }}
  >
    <div className="flex items-center gap-3.5 min-w-0">
      <Avatar name={`${u.first_name || ""} ${u.last_name || ""}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
            {u.first_name} {u.last_name}
          </p>
          {!u.is_active && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 uppercase tracking-wider">
              Inactive
            </span>
          )}
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">
          {u.email}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <RoleBadge role={u.role} />
      <button
        onClick={() => handleDeactivate(u.id)}
        disabled={deactivatingId === u.id || !u.is_active}
        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 border border-transparent hover:border-red-200/60 dark:hover:border-red-800/40 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none active:scale-[0.97]"
      >
        {deactivatingId === u.id ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5" />
        )}
        Deactivate
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
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

  const admins = useMemo(
    () => (users || []).filter((u) => u.role === "admin"),
    [users]
  );

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

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error("Email is required");
    try {
      await companyInvitationsAPI.create({
        email: inviteEmail,
        company_name: "New Company",
        message: inviteMessage,
      });
      toast.success("Invitation sent");
      setShowInviteForm(false);
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to send invitation"
      );
    }
  };

  const handleDeactivate = async (id) => {
    setDeactivatingId(id);
    const result = await dispatch(deactivateUser(id));
    setDeactivatingId(null);
    toast[deactivateUser.fulfilled.match(result) ? "success" : "error"](
      deactivateUser.fulfilled.match(result)
        ? "Admin deactivated"
        : "Failed to deactivate"
    );
  };

  const handleCancelInvitation = async (id) => {
    const result = await dispatch(cancelInvitation(id));
    toast[cancelInvitation.fulfilled.match(result) ? "success" : "error"](
      cancelInvitation.fulfilled.match(result)
        ? "Invitation cancelled"
        : "Failed to cancel"
    );
  };

  /* ── Access denied ── */
  if (!user || user.role !== "platform_admin") {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        style={{
          opacity: 0,
          animation: "fadeUp 0.5s 0ms cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div className="bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/40 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">Access denied</p>
            <p className="text-xs text-red-400 dark:text-red-500 font-medium mt-0.5">
              Platform admins only
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          opacity: 0,
          transform: "translateY(12px)",
          animation:
            "fadeUp 0.5s 0ms cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 blur-lg opacity-25 scale-110" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Crown className="w-[18px] h-[18px] text-white" />
              </div>
            </div>
            Platform Dashboard
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 ml-[52px]">
            Manage company admins and invitations
          </p>
        </div>

        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
            showInviteForm
              ? "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:from-purple-700 hover:to-indigo-700"
          }`}
        >
          {showInviteForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {showInviteForm ? "Close" : "Invite Admin"}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          icon={Building2}
          value={admins.length}
          label="Company Admins"
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          shadowColor="shadow-indigo-500/20"
          delay={60}
        />
        <StatCard
          icon={Users}
          value={admins.filter((u) => u.is_active).length}
          label="Active Admins"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          shadowColor="shadow-emerald-500/20"
          delay={120}
        />
        <StatCard
          icon={Clock}
          value={invitations?.length || 0}
          label="Pending Invites"
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          shadowColor="shadow-amber-500/20"
          delay={180}
        />
      </div>

      {/* ── Invite Form ── */}
      <div
        className="invite-panel"
        style={{
          maxHeight: showInviteForm ? "400px" : "0px",
          opacity: showInviteForm ? 1 : 0,
        }}
      >
        <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/50 overflow-hidden shadow-sm shadow-stone-200/30 dark:shadow-black/10 transition-colors duration-300">
          {/* Invite header */}
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-purple-50/50 dark:bg-purple-900/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 blur-md opacity-20 scale-110" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/15">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Invite Company Admin
                </h3>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                  They&apos;ll receive an email to set up their company
                </p>
              </div>
            </div>
          </div>

          {/* Invite form body */}
          <form onSubmit={handleInvite} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Personal Message{" "}
                <span className="text-stone-400 dark:text-stone-500 font-normal normal-case">
                  optional
                </span>
              </label>
              <input
                type="text"
                placeholder="Add a note to the invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
              >
                <Send className="w-4 h-4" />
                Send Invite
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Admins Table ── */}
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm shadow-stone-200/30 dark:shadow-black/10 overflow-hidden transition-colors duration-300"
        style={{
          opacity: 0,
          transform: "translateY(12px)",
          animation:
            "fadeUp 0.5s 240ms cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Search header */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Company Admins
            </h2>
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 tabular-nums">
              {filteredAdmins.length} result
              {filteredAdmins.length !== 1 && "s"}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} pl-10 pr-10`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-all active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-stone-50/80 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800">
          <div className="col-span-6 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            User
          </div>
          <div className="col-span-3 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            Role
          </div>
          <div className="col-span-3 text-right text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            Actions
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} index={i} />
            ))
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400">
                {search
                  ? "No admins match your search"
                  : "No company admins yet"}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 text-center max-w-xs">
                {search
                  ? "Try a different search term"
                  : "Invite your first admin to get started"}
              </p>
            </div>
          ) : (
            filteredAdmins.map((u, i) => (
              <AdminRow
                key={u.id}
                u={u}
                deactivatingId={deactivatingId}
                handleDeactivate={handleDeactivate}
                index={i}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!isLoading && filteredAdmins.length > 0 && (
          <div className="px-6 py-3 bg-stone-50/80 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800">
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider">
              Showing{" "}
              <span className="text-stone-600 dark:text-stone-300">
                {filteredAdmins.length}
              </span>{" "}
              admin{filteredAdmins.length !== 1 && "s"}
            </p>
          </div>
        )}
      </div>

      {/* ── Pending Invitations ── */}
      {invitations?.length > 0 && (
        <div
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm shadow-stone-200/30 dark:shadow-black/10 overflow-hidden transition-colors duration-300"
          style={{
            opacity: 0,
            transform: "translateY(12px)",
            animation:
              "fadeUp 0.5s 320ms cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 blur-md opacity-20 scale-110" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/15">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Pending Invitations
              </h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                Sent but not yet accepted
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 tabular-nums">
              {invitations.length}
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {invitations.map((inv, i) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-all duration-200 group"
                style={{
                  opacity: 0,
                  transform: "translateY(6px)",
                  animation: `rowIn 0.35s ${i * 50}ms cubic-bezier(0.16,1,0.3,1) forwards`,
                }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {inv.email}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                      Sent{" "}
                      {inv.created_at
                        ? new Date(inv.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "recently"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelInvitation(inv.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 border border-transparent hover:border-red-200/60 dark:hover:border-red-800/40 transition-all duration-200 active:scale-[0.97]"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STYLES ═══ */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .invite-panel {
          transition: max-height 0.5s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.3s ease,
                      margin 0.5s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

export default PlatformDashboard;