import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deactivateUser,
  changeUserRole,
  fetchInvitations,
  createInvitation,
  cancelInvitation,
  resendInvitation,
} from "@/store/slices/usersSlice";
import toast from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Shield,
  Palette,
  Printer,
  User,
  Search,
  X,
  ChevronDown,
  AlertTriangle,
  Users,
  Send,
  Clock,
  Sparkles,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Role Config
   ═══════════════════════════════════════════ */
const ROLE_CONFIG = {
  designer: {
    label: "Designer",
    icon: Palette,
    light:
      "bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-900/15 dark:text-purple-300 dark:border-purple-800/25",
    dot: "bg-purple-500",
  },
  printer: {
    label: "Printer",
    icon: Printer,
    light:
      "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/15 dark:text-amber-300 dark:border-amber-800/25",
    dot: "bg-amber-500",
  },
  client: {
    label: "Client",
    icon: User,
    light:
      "bg-teal-50 text-teal-700 border-teal-200/50 dark:bg-teal-900/15 dark:text-teal-300 dark:border-teal-800/25",
    dot: "bg-teal-500",
  },
};
const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.client;

/* ═══════════════════════════════════════════
   Shared Classes
   ═══════════════════════════════════════════ */
const inputClass =
  "w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none transition-all";

const labelClass =
  "block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2";

/* ═══════════════════════════════════════════
   Skeleton Row
   ═══════════════════════════════════════════ */
const SkeletonRow = ({ index }) => (
  <div
    className="flex items-center gap-4 px-5 py-4"
    style={{
      opacity: 0,
      animation: `skeletonIn 0.4s ${index * 60}ms ease-out forwards`,
    }}
  >
    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
    <div className="flex-1 space-y-2.5">
      <div className="h-4 w-40 rounded-lg bg-stone-200 dark:bg-stone-800 animate-pulse" />
      <div className="h-3 w-56 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
    </div>
    <div className="h-7 w-24 rounded-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
    <div className="h-8 w-20 rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
  </div>
);

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
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-orange-600/15`}
    >
      {initials}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Role Badge
   ═══════════════════════════════════════════ */
const RoleBadge = ({ role }) => {
  const config = getRoleConfig(role);
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all duration-200 ${config.light}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/* ═══════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════ */
function StatCard({ icon, label, value, accent, delay = 0 }) {
  return (
    <div
      className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-5 flex items-center gap-4 hover:shadow-md hover:shadow-stone-200/40 dark:hover:shadow-stone-900/20 hover:-translate-y-0.5 transition-all duration-300"
      style={{
        opacity: 0,
        transform: "translateY(12px)",
        animation: `fadeUp 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards`,
      }}
    >
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-lg shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Filter Pill
   ═══════════════════════════════════════════ */
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-[0.98] ${
        active
          ? "bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-md shadow-stone-900/15 dark:shadow-white/10 border-transparent"
          : "bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200/70 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:text-stone-700 dark:hover:text-stone-200"
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════
   User Row (extracted for stagger animation)
   ═══════════════════════════════════════════ */
const UserRow = ({
  u,
  currentUser,
  isCompanyAdmin,
  roleOptions,
  deactivatingId,
  handleRoleChange,
  handleDeactivate,
  index,
}) => {
  const isSelf = u.id === currentUser?.id;
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      key={u.id}
      className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-all duration-200 group"
      style={{
        opacity: 0,
        transform: "translateY(8px)",
        animation: `rowIn 0.4s ${index * 40}ms cubic-bezier(0.16,1,0.3,1) forwards`,
      }}
    >
      {/* User info */}
      <div className="sm:col-span-5 flex items-center gap-3">
        <Avatar name={`${u.first_name || ""} ${u.last_name || ""}`} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
            {u.first_name} {u.last_name}
            {isSelf && (
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fff7ed] dark:bg-[#c2410c]/15 text-[#c2410c] dark:text-[#ea580c] uppercase tracking-wider">
                You
              </span>
            )}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">
            {u.email}
          </p>
        </div>
      </div>

      {/* Role */}
      <div className="sm:col-span-3 flex items-center">
        <RoleBadge role={u.role} />
      </div>

      {/* Status */}
      <div className="sm:col-span-2 flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            u.is_active
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-stone-400 dark:text-stone-500"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              u.is_active
                ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                : "bg-stone-300 dark:bg-stone-600"
            }`}
          />
          {u.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Actions */}
      <div className="sm:col-span-2 flex items-center justify-end gap-2">
        {isCompanyAdmin && !isSelf ? (
          <>
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                className="text-xs font-semibold rounded-lg border border-stone-200/70 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-2 focus:outline-none focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 transition-all cursor-pointer appearance-none"
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleDeactivate(u.id)}
                disabled={deactivatingId === u.id}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
              >
                {deactivatingId === u.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                Deactivate
              </button>
            </div>

            {/* Mobile actions menu */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-1 z-20 w-48 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xl shadow-stone-900/10 dark:shadow-black/30 overflow-hidden"
                    style={{
                      animation:
                        "dropdownIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
                    }}
                  >
                    <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-700">
                      <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                        Change Role
                      </p>
                    </div>
                    {roleOptions.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => {
                          handleRoleChange(u.id, r.value);
                          setShowActions(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                          u.role === r.value
                            ? "bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] dark:text-[#ea580c] font-bold"
                            : "text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                        }`}
                      >
                        {r.label}
                        {u.role === r.value && (
                          <span className="ml-auto text-[10px]">✓</span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-stone-100 dark:border-stone-700">
                      <button
                        onClick={() => {
                          handleDeactivate(u.id);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold transition-colors flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Deactivate
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : isSelf ? (
          <span className="text-[11px] text-stone-400 dark:text-stone-600 italic font-medium hidden sm:inline">
            Current account
          </span>
        ) : null}
      </div>
    </div>
  );
};

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
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "",
    message: "",
  });

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

  const filteredUsers = useMemo(() => {
    let list = (users || []).filter(
      (u) => !["platform_admin", "admin"].includes(u.role)
    );
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") list = list.filter((u) => u.role === filterRole);
    return list;
  }, [users, search, filterRole]);

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(filteredUsers.map((u) => u.role))];
    return roles.map((r) => ({ value: r, label: getRoleConfig(r).label }));
  }, [filteredUsers]);

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

  const handleResendInvitation = async (token) => {
    const result = await dispatch(resendInvitation(token));
    toast[resendInvitation.fulfilled.match(result) ? "success" : "error"](
      resendInvitation.fulfilled.match(result)
        ? "Invitation resent"
        : "Failed to resend"
    );
  };

  const handleDeactivate = async (id) => {
    setDeactivatingId(id);
    const result = await dispatch(deactivateUser(id));
    setDeactivatingId(null);
    toast[deactivateUser.fulfilled.match(result) ? "success" : "error"](
      deactivateUser.fulfilled.match(result)
        ? "User deactivated"
        : "Failed to deactivate user"
    );
  };

  const handleRoleChange = async (id, role) => {
    const result = await dispatch(changeUserRole({ id, role }));
    if (changeUserRole.fulfilled.match(result)) toast.success("Role updated");
  };

  const handleCancelInvitation = async (id) => {
    const result = await dispatch(cancelInvitation(id));
    toast[cancelInvitation.fulfilled.match(result) ? "success" : "error"](
      cancelInvitation.fulfilled.match(result)
        ? "Invitation cancelled"
        : "Failed to cancel"
    );
  };

  /* ═══════════════════════════════ RENDER ═════════════════════ */
  return (
    <div className="min-h-full bg-[#faf9f6] dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] shadow-lg shadow-orange-600/15">
                <Users className="w-[18px] h-[18px] text-white" />
              </div>
              Team Members
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 ml-12">
              Manage your company&apos;s team members and invitations
            </p>
          </div>

          {isCompanyAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white text-sm font-bold shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 hover:from-[#92400e] hover:to-[#c2410c] active:scale-[0.98] transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Team"
            value={filteredUsers.length}
            accent="from-[#c2410c] to-[#ea580c]"
            delay={60}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Invites"
            value={invitations?.length || 0}
            accent="from-[#92400e] to-[#c2410c]"
            delay={120}
          />
          <StatCard
            icon={<Sparkles className="w-5 h-5" />}
            label="Active Roles"
            value={uniqueRoles.length}
            accent="from-[#ea580c] to-[#f97316]"
            delay={180}
          />
        </div>

        {/* ── Search & Filters ── */}
        <div
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300"
          style={{
            opacity: 0,
            transform: "translateY(12px)",
            animation:
              "fadeUp 0.5s 200ms cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95"
                >
                  <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                showFilters || filterRole !== "all"
                  ? "bg-[#fff7ed] dark:bg-[#c2410c]/10 border-[#c2410c]/20 dark:border-[#c2410c]/30 text-[#c2410c] dark:text-[#ea580c]"
                  : "bg-stone-50 dark:bg-stone-800 border-stone-200/70 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
              }`}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
              Filter by Role
            </button>
          </div>

          {showFilters && (
            <div
              className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2"
              style={{
                opacity: 0,
                animation: "fadeIn 0.25s ease-out forwards",
              }}
            >
              <FilterPill
                active={filterRole === "all"}
                onClick={() => setFilterRole("all")}
              >
                All ({filteredUsers.length})
              </FilterPill>
              {uniqueRoles.map((r) => (
                <FilterPill
                  key={r.value}
                  active={filterRole === r.value}
                  onClick={() => setFilterRole(r.value)}
                >
                  {r.label}
                </FilterPill>
              ))}
            </div>
          )}
        </div>

        {/* ── Users Table ── */}
        <div
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300"
          style={{
            opacity: 0,
            transform: "translateY(12px)",
            animation:
              "fadeUp 0.5s 280ms cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-stone-50/80 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800">
            {[
              { span: 5, label: "User" },
              { span: 3, label: "Role" },
              { span: 2, label: "Status", align: "center" },
              { span: 2, label: "Actions", align: "right" },
            ].map((col) => (
              <div
                key={col.label}
                className={`col-span-${col.span} text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest ${
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : ""
                }`}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} index={i} />
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-stone-500">
                <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-stone-300 dark:text-stone-600" />
                </div>
                <p className="text-sm font-bold text-stone-500 dark:text-stone-400">
                  No team members found
                </p>
                <p className="text-xs text-stone-400 mt-1.5 text-center max-w-xs">
                  {search || filterRole !== "all"
                    ? "Try adjusting your search or filters"
                    : "Invite your first team member to get started"}
                </p>
              </div>
            ) : (
              filteredUsers.map((u, i) => (
                <UserRow
                  key={u.id}
                  u={u}
                  currentUser={currentUser}
                  isCompanyAdmin={isCompanyAdmin}
                  roleOptions={roleOptions}
                  deactivatingId={deactivatingId}
                  handleRoleChange={handleRoleChange}
                  handleDeactivate={handleDeactivate}
                  index={i}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="px-5 py-3 bg-stone-50/80 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800">
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider">
                Showing{" "}
                <span className="text-stone-600 dark:text-stone-300">
                  {filteredUsers.length}
                </span>{" "}
                team member{filteredUsers.length !== 1 && "s"}
              </p>
            </div>
          )}
        </div>

        {/* ── Pending Invitations ── */}
        {invitations?.length > 0 && (
          <div
            className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300"
            style={{
              opacity: 0,
              transform: "translateY(12px)",
              animation:
                "fadeUp 0.5s 360ms cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-md opacity-20 scale-110" />
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/15">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Pending Invitations
                </h2>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                  Sent but not yet accepted
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] dark:text-[#ea580c] tabular-nums">
                {invitations.length}
              </span>
            </div>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {invitations.map((inv, i) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-all duration-200"
                  style={{
                    opacity: 0,
                    transform: "translateY(6px)",
                    animation: `rowIn 0.35s ${i * 50}ms cubic-bezier(0.16,1,0.3,1) forwards`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#fff7ed] dark:bg-[#c2410c]/10 border border-[#c2410c]/15 dark:border-[#c2410c]/20 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#c2410c]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {inv.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {inv.role && (
                          <RoleBadge role={inv.role} />
                        )}
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">
                          Sent{" "}
                          {inv.created_at
                            ? new Date(
                                inv.created_at
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "recently"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => handleResendInvitation(inv.token)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/15 border border-sky-200/50 dark:border-sky-800/30 hover:bg-sky-100 dark:hover:bg-sky-900/30 active:scale-[0.97] transition-all"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Resend
                    </button>
                    <button
                      onClick={() => handleCancelInvitation(inv.token)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.97] transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Invite Modal ── */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-anim">
            <div
              className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-md"
              onClick={() => setShowInviteModal(false)}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl shadow-stone-900/10 dark:shadow-black/30 border border-stone-200/70 dark:border-stone-800 overflow-hidden modal-anim">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-30 scale-110" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/20">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      Invite Team Member
                    </h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                      Add a Designer, Printer, or Client
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 transition-all duration-200 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleInvite} className="p-6 space-y-5">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, email: e.target.value })
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value })
                    }
                    className={`${inputClass} appearance-none cursor-pointer pr-10
                      bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20fill%3D%22none%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m2%205%205%205%205-5%22%2F%3E%3C%2Fsvg%3E')]
                      bg-[length:14px] bg-[right_14px_center] bg-no-repeat`}
                  >
                    <option value="">Select a role</option>
                    {roleOptions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Message{" "}
                    <span className="text-stone-400 dark:text-stone-500 font-normal normal-case">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add a personal note to the invitation..."
                    value={inviteForm.message}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, message: e.target.value })
                    }
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Role preview chips */}
                {inviteForm.role && (
                  <div
                    className="flex items-center gap-2"
                    style={{
                      opacity: 0,
                      animation: "fadeIn 0.2s ease-out forwards",
                    }}
                  >
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                      Will be invited as:
                    </span>
                    <RoleBadge role={inviteForm.role} />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/70 dark:border-stone-700 active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 hover:from-[#92400e] hover:to-[#c2410c] active:scale-[0.98] transition-all duration-200"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ═══ STYLES ═══ */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-anim { animation: modal-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .overlay-anim { animation: overlay-in 0.25s ease forwards; }
      `}</style>
    </div>
  );
};

export default UsersList;