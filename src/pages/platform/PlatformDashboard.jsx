import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers, deactivateUser, fetchInvitations, cancelInvitation,
} from "@/store/slices/usersSlice";
import toast from "react-hot-toast";
import { companyInvitationsAPI } from "@/api/api";
import {
  Users, Mail, Shield, Search, X, Send, Clock, Loader2,
  Crown, Building2, Lock, MoreVertical, RefreshCw,
  Plus, Inbox, UserCheck, UserX, Calendar, Activity,
  Zap, Eye, CheckCircle,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────
const ROLE_CFG = {
  platform_admin: { label: "Platform Admin", icon: Crown, badge: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/40", dot: "bg-violet-500", av: "from-violet-500 to-purple-600" },
  admin:          { label: "Company Admin",  icon: Shield, badge: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/40", dot: "bg-indigo-500", av: "from-indigo-500 to-blue-600" },
  designer:       { label: "Designer",       icon: Zap,    badge: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/40",   dot: "bg-pink-500",   av: "from-pink-500 to-rose-500" },
  printer:        { label: "Printer",        icon: Activity, badge: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/40",     dot: "bg-sky-500",    av: "from-sky-500 to-cyan-600" },
  client:         { label: "Client",         icon: Users,  badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40", dot: "bg-emerald-500", av: "from-emerald-500 to-teal-500" },
};
const TABS = [
  { id: "overview",     label: "Overview",     icon: Activity },
  { id: "users",        label: "Users",        icon: Shield },
  { id: "invitations",  label: "Invitations",  icon: Mail },
];
const inp = "w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400/50 outline-none transition-all";
const lbl = "block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const timeAgo = (d) => { if (!d) return "—"; const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; };

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Avatar = ({ name = "", role = "admin", size = "md" }) => {
  const cfg = ROLE_CFG[role] || ROLE_CFG.admin;
  const initials = name.split(" ").map(n => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2) || "?";
  const sz = { sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-11 h-11 text-sm" }[size];
  return <div className={`${sz} rounded-full bg-gradient-to-br ${cfg.av} flex items-center justify-center text-white font-black shrink-0 shadow-sm`}>{initials}</div>;
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CFG[role] || ROLE_CFG.admin;
  const Icon = cfg.icon;
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${cfg.badge}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /><Icon className="w-3 h-3" />{cfg.label}</span>;
};

const ActiveDot = ({ active }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`relative w-2 h-2 rounded-full shrink-0 ${active ? "bg-emerald-500" : "bg-stone-300 dark:bg-stone-600"}`}>
      {active && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />}
    </span>
    <span className={`text-[11px] font-semibold ${active ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400"}`}>{active ? "Active" : "Inactive"}</span>
  </span>
);

const MetricCard = ({ icon: Icon, value, label, sub, gradient, delay = 0 }) => (
  <div className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-5 overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    style={{ opacity: 0, transform: "translateY(14px)", animation: `rise 0.5s ${delay}ms cubic-bezier(.16,1,.3,1) forwards` }}>
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${gradient} opacity-[.06] blur-2xl group-hover:opacity-[.1] transition-opacity duration-500`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-black text-stone-900 dark:text-stone-100 tabular-nums leading-none">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-1.5 font-medium">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

// ─── INVITE MODAL — centered, works with any sidebar width ────────────────────
// KEY FIX: This is a centered modal (not a right drawer) so it never overlaps
// the left sidebar and is always fully visible regardless of sidebar width.
const InviteModal = ({ open, onClose, onSent }) => {
  const [email, setEmail]       = useState("");
  const [company, setCompany]   = useState("");
  const [message, setMessage]   = useState("");
  const [sending, setSending]   = useState(false);

  const reset = () => { setEmail(""); setCompany(""); setMessage(""); };

  const submit = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return toast.error("Email is required");
    setSending(true);
    try {
      await companyInvitationsAPI.create({ email: email.trim(), company_name: company.trim() || "New Company", message: message.trim() });
      toast.success(`Invitation sent to ${email}`);
      reset(); onSent?.(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.email?.[0] || "Failed to send invitation");
    } finally { setSending(false); }
  };

  if (!open) return null;
  return (
    // Fixed overlay covers full viewport — centered regardless of sidebar
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ animation: "fadeIn .2s ease" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700 w-full max-w-md overflow-hidden"
        style={{ animation: "modalPop .3s cubic-bezier(.16,1,.3,1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 dark:text-stone-100">Invite Company Admin</h3>
              <p className="text-xs text-stone-400 mt-0.5">They'll receive a setup link by email</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-all active:scale-95">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className={lbl}>Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="email" required placeholder="admin@theircompany.com" value={email} onChange={e => setEmail(e.target.value)} className={`${inp} pl-10`} autoFocus />
            </div>
          </div>
          <div>
            <label className={lbl}>Company Name <span className="font-normal normal-case text-stone-400">optional</span></label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" placeholder="e.g. Sunrise Print Studio" value={company} onChange={e => setCompany(e.target.value)} className={`${inp} pl-10`} />
            </div>
          </div>
          <div>
            <label className={lbl}>Personal Message <span className="font-normal normal-case text-stone-400">optional</span></label>
            <textarea placeholder="Add a warm note..." value={message} onChange={e => setMessage(e.target.value)} rows={3} className={`${inp} resize-none`} />
          </div>
          {/* Preview */}
          {email && (
            <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/15 rounded-xl border border-violet-200/60 dark:border-violet-800/30">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{email}</p>
                {company && <p className="text-[11px] text-stone-400">{company}</p>}
              </div>
              <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 ml-auto" />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 text-sm font-bold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">
            Cancel
          </button>
          <button onClick={submit} disabled={sending || !email.trim()} className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-violet-500/20 disabled:opacity-50 active:scale-[.98] transition-all flex items-center justify-center gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin row with context menu ──────────────────────────────────────────────
const AdminRow = ({ u, onDeactivate, deactivatingId, index }) => {
  const [menu, setMenu] = useState(false);
  const name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unnamed";
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-800/20 border-b border-stone-100 dark:border-stone-800/60 last:border-0 group transition-colors"
      style={{ opacity: 0, transform: "translateY(5px)", animation: `rise 0.35s ${index * 35}ms cubic-bezier(.16,1,.3,1) forwards` }}>
      <Avatar name={name} role={u.role} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{name}</p>
          {!u.is_active && <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-stone-100 dark:bg-stone-800 text-stone-400 uppercase tracking-wider border border-stone-200 dark:border-stone-700">Inactive</span>}
        </div>
        <p className="text-xs text-stone-400 truncate mt-0.5">{u.email}</p>
      </div>
      {u.company_name && (
        <div className="hidden md:flex items-center gap-1.5 shrink-0 max-w-[130px]">
          <Building2 className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate">{u.company_name}</span>
        </div>
      )}
      <RoleBadge role={u.role} />
      <ActiveDot active={u.is_active} />
      <span className="hidden lg:block text-[11px] text-stone-400 whitespace-nowrap tabular-nums">{timeAgo(u.date_joined)}</span>
      <div className="relative shrink-0">
        <button onClick={() => setMenu(!menu)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 opacity-0 group-hover:opacity-100 transition-all active:scale-95">
          <MoreVertical className="w-4 h-4" />
        </button>
        {menu && (<>
          <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-20 w-44 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xl overflow-hidden"
            style={{ animation: "dropIn 0.18s cubic-bezier(.16,1,.3,1)" }}>
            <button onClick={() => setMenu(false)} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium">
              <Eye className="w-4 h-4 text-stone-400" /> View Profile
            </button>
            <div className="h-px bg-stone-100 dark:bg-stone-800" />
            {u.is_active
              ? <button onClick={() => { onDeactivate(u.id); setMenu(false); }} disabled={deactivatingId === u.id} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold disabled:opacity-50">
                  {deactivatingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Deactivate
                </button>
              : <button onClick={() => setMenu(false)} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 font-semibold">
                  <UserCheck className="w-4 h-4" /> Reactivate
                </button>
            }
          </div>
        </>)}
      </div>
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ users, invitations }) => {
  const admins = (users || []).filter(u => u.role === "admin");
  const active = admins.filter(u => u.is_active);
  const recent = [...admins].sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined)).slice(0, 5);
  const breakdown = (users || []).reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
  const metrics = [
    { icon: Building2, value: admins.length,           label: "Company Admins",  sub: `${active.length} active`,         gradient: "bg-gradient-to-br from-indigo-500 to-violet-600", delay: 0   },
    { icon: UserCheck, value: active.length,            label: "Active Accounts", sub: admins.length ? `${Math.round(active.length / admins.length * 100)}% rate` : "—", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600", delay: 80  },
    { icon: Clock,     value: invitations?.length || 0, label: "Pending Invites", sub: "awaiting acceptance",             gradient: "bg-gradient-to-br from-amber-500 to-orange-500", delay: 160 },
    { icon: Users,     value: users?.length || 0,       label: "Total Users",     sub: "across all companies",            gradient: "bg-gradient-to-br from-sky-500 to-blue-600",     delay: 240 },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{metrics.map((m, i) => <MetricCard key={i} {...m} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden" style={{ opacity: 0, animation: "rise 0.5s 300ms cubic-bezier(.16,1,.3,1) forwards" }}>
          <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <h3 className="font-black text-stone-900 dark:text-stone-100 text-sm">Recent Admins</h3>
            <span className="text-[11px] text-stone-400">Latest joined</span>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {!recent.length
              ? <div className="flex flex-col items-center py-12 text-stone-400"><Users className="w-8 h-8 mb-2 text-stone-200 dark:text-stone-700" /><p className="text-sm font-medium">No admins yet</p></div>
              : recent.map((u, i) => {
                  const name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unnamed";
                  return (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors" style={{ opacity: 0, animation: `rise 0.35s ${300 + i * 40}ms ease forwards` }}>
                      <Avatar name={name} role={u.role} size="sm" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">{name}</p><p className="text-xs text-stone-400 truncate">{u.email}</p></div>
                      <div className="text-right shrink-0"><ActiveDot active={u.is_active} /><p className="text-[11px] text-stone-400 mt-1 tabular-nums">{timeAgo(u.date_joined)}</p></div>
                    </div>
                  );
                })
            }
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden" style={{ opacity: 0, animation: "rise 0.5s 380ms cubic-bezier(.16,1,.3,1) forwards" }}>
          <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800"><h3 className="font-black text-stone-900 dark:text-stone-100 text-sm">User Breakdown</h3></div>
          <div className="p-5 space-y-4">
            {Object.entries(breakdown).map(([role, count]) => {
              const cfg = ROLE_CFG[role]; if (!cfg) return null;
              const pct = Math.round(count / (users?.length || 1) * 100);
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1.5"><span className="text-xs font-bold text-stone-600 dark:text-stone-400">{cfg.label}</span><span className="text-xs font-black text-stone-800 dark:text-stone-200 tabular-nums">{count}</span></div>
                  <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${cfg.dot} transition-all duration-700`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
            {!Object.keys(breakdown).length && <p className="text-sm text-stone-400 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab = ({ users, isLoading, onInvite }) => {
  const dispatch = useDispatch();
  const [search, setSearch]     = useState("");
  const [roleF, setRoleF]       = useState("all");
  const [statusF, setStatusF]   = useState("all");
  const [deactId, setDeactId]   = useState(null);

  const filtered = useMemo(() => {
    let list = users || [];
    if (roleF !== "all") list = list.filter(u => u.role === roleF);
    if (statusF === "active")   list = list.filter(u => u.is_active);
    if (statusF === "inactive") list = list.filter(u => !u.is_active);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(u => (u.first_name + " " + u.last_name + " " + u.email + " " + (u.company_name || "")).toLowerCase().includes(q)); }
    return list;
  }, [users, roleF, statusF, search]);

  const handleDeactivate = useCallback(async (id) => {
    setDeactId(id);
    const r = await dispatch(deactivateUser(id));
    setDeactId(null);
    if (deactivateUser.fulfilled.match(r)) { toast.success("User deactivated"); dispatch(fetchUsers()); }
    else toast.error("Failed to deactivate");
  }, [dispatch]);

  const chip = (active) => `px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 ${active ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-sm" : "bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400"}`;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden" style={{ opacity: 0, animation: "rise 0.4s ease forwards" }}>
      <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-black text-stone-900 dark:text-stone-100 text-sm">All Users {filtered.length > 0 && <span className="ml-1.5 text-[11px] font-semibold text-stone-400">({filtered.length})</span>}</h2>
          <button onClick={onInvite} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all">
            <Plus className="w-3.5 h-3.5" /> Invite Admin
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search by name, email or company..." value={search} onChange={e => setSearch(e.target.value)} className={`${inp} pl-10 ${search ? "pr-9" : ""}`} />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-600 active:scale-95"><X className="w-3 h-3" /></button>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "admin", "designer", "printer", "client"].map(r => <button key={r} onClick={() => setRoleF(r)} className={chip(roleF === r)}>{r === "all" ? "All Roles" : ROLE_CFG[r]?.label || r}</button>)}
          <div className="w-px bg-stone-200 dark:bg-stone-700 mx-1" />
          {["all", "active", "inactive"].map(s => <button key={s} onClick={() => setStatusF(s)} className={chip(statusF === s)}>{s === "all" ? "Any Status" : s[0].toUpperCase() + s.slice(1)}</button>)}
        </div>
      </div>
      <div>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-stone-100 dark:border-stone-800/60 last:border-0" style={{ opacity: 0, animation: `rise 0.4s ${i * 50}ms ease-out forwards` }}>
                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-4 w-36 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" /><div className="h-3 w-52 rounded bg-stone-50 dark:bg-stone-800/60 animate-pulse" /></div>
                <div className="h-6 w-28 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
              </div>
            ))
          : !filtered.length
          ? <div className="flex flex-col items-center justify-center py-16"><div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4"><Users className="w-6 h-6 text-stone-300 dark:text-stone-600" /></div><p className="font-bold text-stone-500 text-sm">{search ? "No users match" : "No users found"}</p><p className="text-xs text-stone-400 mt-1">{search ? "Clear filters" : "Invite your first admin"}</p></div>
          : filtered.map((u, i) => <AdminRow key={u.id} u={u} onDeactivate={handleDeactivate} deactivatingId={deactId} index={i} />)
        }
      </div>
      {!isLoading && filtered.length > 0 && (
        <div className="px-5 py-3 bg-stone-50/80 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800">
          <p className="text-[11px] text-stone-400 font-semibold">{filtered.length} user{filtered.length !== 1 && "s"} shown{(roleF !== "all" || statusF !== "all" || search) && " (filtered)"}</p>
        </div>
      )}
    </div>
  );
};

// ─── Invitations Tab ──────────────────────────────────────────────────────────
const InvitationsTab = ({ invitations, isLoading, onInvite, onCancel }) => {
  const [cancelId, setCancelId] = useState(null);
  const handleCancel = async (id) => { setCancelId(id); await onCancel(id); setCancelId(null); };
  return (
    <div className="space-y-4" style={{ opacity: 0, animation: "rise 0.4s ease forwards" }}>
      <div className="flex items-center justify-between">
        <h2 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
          Pending Invitations
          {invitations?.length > 0 && <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-black border border-amber-200/60 dark:border-amber-800/40 tabular-nums">{invitations.length}</span>}
        </h2>
        <button onClick={onInvite} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all">
          <Plus className="w-3.5 h-3.5" /> New Invite
        </button>
      </div>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden">
        {isLoading
          ? <div className="p-12 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          : !invitations?.length
          ? <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4"><Inbox className="w-7 h-7 text-stone-300 dark:text-stone-600" /></div>
              <p className="font-bold text-stone-500 text-sm">No pending invitations</p>
              <p className="text-xs text-stone-400 mt-1">Sent invitations appear here</p>
              <button onClick={onInvite} className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all"><Send className="w-3.5 h-3.5" /> Send First Invite</button>
            </div>
          : <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {invitations.map((inv, i) => (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/20 group transition-colors"
                  style={{ opacity: 0, transform: "translateY(5px)", animation: `rise 0.35s ${i * 40}ms ease forwards` }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-amber-500 dark:text-amber-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{inv.email}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {inv.company_name && <span className="text-xs text-stone-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{inv.company_name}</span>}
                      <span className="text-[11px] text-stone-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Sent {fmtDate(inv.created_at)}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 shrink-0"><Clock className="w-3 h-3" /> Pending</span>
                  <button onClick={() => handleCancel(inv.id)} disabled={cancelId === inv.id} className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border border-transparent hover:border-red-200/60 transition-all disabled:opacity-50 active:scale-95 shrink-0">
                    {cancelId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Cancel
                  </button>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const PlatformDashboard = () => {
  const dispatch = useDispatch();
  const { users, invitations, isLoading } = useSelector(s => s.users);
  const { user } = useSelector(s => s.auth);
  const [tab, setTab]           = useState("overview");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchInvitations()); }, [dispatch]);

  const handleRefresh = () => { dispatch(fetchUsers()); dispatch(fetchInvitations()); toast.success("Refreshed"); };
  const handleCancelInv = async (id) => {
    const r = await dispatch(cancelInvitation(id));
    if (cancelInvitation.fulfilled.match(r)) { toast.success("Invitation cancelled"); dispatch(fetchInvitations()); }
    else toast.error("Failed to cancel");
  };

  if (!user || user.role !== "platform_admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/40 rounded-2xl p-6 flex items-center gap-4 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0"><Lock className="w-6 h-6 text-red-500" /></div>
          <div><p className="font-black text-red-700 dark:text-red-400">Access Denied</p><p className="text-xs text-red-400 mt-0.5 font-medium">Platform admins only</p></div>
        </div>
      </div>
    );
  }

  const admins = (users || []).filter(u => u.role === "admin");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ opacity: 0, animation: "rise 0.5s ease forwards" }}>
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 blur-lg opacity-30 scale-110" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25"><Crown className="w-[18px] h-[18px] text-white" /></div>
            </div>
            Platform Dashboard
          </h1>
          <p className="text-sm text-stone-400 mt-1.5 ml-[52px]">Manage all companies, admins & invitations</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={handleRefresh} disabled={isLoading} className="flex items-center gap-1.5 px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-500 dark:text-stone-400 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 active:scale-[.98] transition-all">
            <Send className="w-4 h-4" /> Invite Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-xl w-fit" style={{ opacity: 0, animation: "rise 0.5s 80ms ease forwards" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const count = t.id === "users" ? admins.length : t.id === "invitations" ? (invitations?.length || 0) : null;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${tab === t.id ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"}`}>
              <Icon className="w-4 h-4" />
              {t.label}
              {count !== null && count > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md tabular-nums ${tab === t.id ? "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300" : "bg-stone-200 dark:bg-stone-700 text-stone-500"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div key={tab}>
        {tab === "overview"    && <OverviewTab users={users} invitations={invitations} />}
        {tab === "users"       && <UsersTab users={users} isLoading={isLoading} onInvite={() => setShowInvite(true)} />}
        {tab === "invitations" && <InvitationsTab invitations={invitations} isLoading={isLoading} onInvite={() => setShowInvite(true)} onCancel={handleCancelInv} />}
      </div>

      {/* Centered invite modal — safe with any sidebar layout */}
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onSent={() => dispatch(fetchInvitations())} />

      <style>{`
        @keyframes rise    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dropIn  { from { opacity:0; transform:translateY(-6px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes modalPop{ from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default PlatformDashboard;