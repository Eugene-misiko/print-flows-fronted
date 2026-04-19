import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchCompany,updateCompany,fetchSettings,updateSettings,} from "@/store/slices/companySlice";
import toast from "react-hot-toast";
import {Building2,Coins,Smartphone,ShieldCheck,Check,Loader2,Mail,Globe,MapPin,Phone,Link,User,ChevronRight,Lock,} from "lucide-react";

//navigation items for the left sidebar (scrollspy)
const NAV_ITEMS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "currency", label: "Currency", icon: Coins },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
  { id: "access", label: "Access", icon: ShieldCheck },
];

const inputClass =
  "w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all";

const labelClass =
  "block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2";

//section header with icon, title and description (used in each settings section)
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100 dark:border-stone-800">
    <div className="relative">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-20 dark:opacity-10 scale-110" />
      <div className="relative w-10 h-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/15 dark:shadow-orange-600/10">
        <Icon className="w-[18px] h-[18px] text-white" />
      </div>
    </div>
    <div>
      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
        {title}
      </h3>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
        {description}
      </p>
    </div>
  </div>
);

//input field with optional left icon and hint text (used in all forms)
const InputField = ({ label, hint, leftIcon: LeftIcon, disabled, className = "", ...props }) => (
  <div>
    {label && <label className={labelClass}>{label}</label>}
    <div className="relative">
      {LeftIcon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
          <LeftIcon className="w-4 h-4" />
        </span>
      )}
      <input
        disabled={disabled}
        className={`${inputClass} ${LeftIcon ? "pl-10" : ""} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
    {hint && (
      <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">{hint}</p>
    )}
  </div>
);

  // SELECT FIELD WITH CUSTOM ARROW
const SelectField = ({ label, hint, disabled, children, ...props }) => (
  <div>
    {label && <label className={labelClass}>{label}</label>}
    <div className="relative">
      <select
        disabled={disabled}
        className={`${inputClass} appearance-none pr-10 disabled:opacity-40 disabled:cursor-not-allowed
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20fill%3D%22none%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m2%205%205%205%205-5%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:14px] bg-[right_14px_center] bg-no-repeat`}
        {...props}
      >
        {children}
      </select>
    </div>
    {hint && (
      <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">{hint}</p>
    )}
  </div>
);

//toggle switch for M-Pesa enable/disable
const Toggle = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange?.(!checked)}
    className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 transition-all duration-200
      ${checked
        ? "border-[#c2410c]/20 bg-[#fff7ed] dark:border-[#c2410c]/15 dark:bg-[#c2410c]/5"
        : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800/60 dark:hover:border-stone-600"
      }
      disabled:cursor-not-allowed disabled:opacity-40`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300 ${
          checked
            ? "bg-gradient-to-br from-[#c2410c] to-[#ea580c] text-white shadow-md shadow-orange-600/15 dark:shadow-orange-600/10"
            : "bg-stone-100 text-stone-400 dark:bg-stone-700 dark:text-stone-500"
        }`}
      >
        <Smartphone className="h-4 w-4" />
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{label}</p>
        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
          {checked ? "Enabled — customers can pay via M-Pesa" : "Disabled — M-Pesa not available at checkout"}
        </p>
      </div>
    </div>
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
        checked ? "bg-gradient-to-r from-[#c2410c] to-[#ea580c]" : "bg-stone-300 dark:bg-stone-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "translate-x-6 scale-100" : "translate-x-1 scale-90"
        }`}
      />
    </span>
  </button>
);

// DEPOSIT SLIDER
const DepositSlider = ({ value, onChange, disabled }) => (
  <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all duration-200 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800/40 dark:hover:border-stone-600">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">Deposit Required</p>
        <p className="mt-0.5 text-[11px] text-stone-400 dark:text-stone-500">
          Minimum amount to confirm a booking
        </p>
      </div>
      <span className="rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] px-3 py-1.5 text-sm font-bold tabular-nums text-white shadow-md shadow-orange-600/15 dark:shadow-orange-600/10">
        {value}%
      </span>
    </div>
    <input
      type="range"
      min="0" max="100" step="5"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="deposit-slider w-full"
    />
    <div className="flex justify-between text-[11px] text-stone-400 dark:text-stone-500">
      <span>No deposit</span>
      <span>Full payment</span>
    </div>
    <style>{`
      .deposit-slider { -webkit-appearance:none; appearance:none; height:6px; border-radius:9999px; outline:none; cursor:pointer;
        background: linear-gradient(to right, #c2410c 0%, #ea580c ${value}%, #e7e5e4 ${value}%, #e7e5e4 100%);
        transition: opacity 0.2s; }
      .deposit-slider:disabled { opacity:0.35; cursor:not-allowed; }
      .dark .deposit-slider { background: linear-gradient(to right, #ea580c 0%, #f97316 ${value}%, #44403c ${value}%, #44403c 100%); }
      .deposit-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid #c2410c;
        box-shadow:0 1px 8px rgba(194,65,12,0.25); transition:transform 0.15s ease, box-shadow 0.15s ease; }
      .deposit-slider::-webkit-slider-thumb:hover { transform:scale(1.2); box-shadow:0 2px 12px rgba(194,65,12,0.35); }
      .dark .deposit-slider::-webkit-slider-thumb { border-color:#ea580c; box-shadow:0 1px 8px rgba(234,88,12,0.2); }
      .deposit-slider::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid #c2410c; box-shadow:0 1px 8px rgba(194,65,12,0.25); }
      .dark .deposit-slider::-moz-range-thumb { border-color:#ea580c; }
    `}</style>
  </div>
);

//saves button with loading and success states
const SaveButton = ({ isLoading, children, saved, disabled }) => (
  <button
    type="submit"
    disabled={isLoading || disabled}
    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
      saved
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
        : "bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white shadow-lg shadow-orange-600/20 dark:shadow-orange-900/30 hover:shadow-orange-600/30"
    }`}
  >
    {saved ? (
      <><Check className="w-4 h-4" /> {children}</>
    ) : isLoading ? (
      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
    ) : (
      <><Check className="w-4 h-4" /> {children}</>
    )}
  </button>
);

//animated section wrapper that reveals content on scroll (used for each settings section)
const Section = ({ id, children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className="scroll-mt-8"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </section>
  );
};

//card wrapper for each section 
const Card = ({ headerProps, children }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden transition-colors duration-300">
    <SectionHeader {...headerProps} />
    <div className="p-6">{children}</div>
  </div>
);

//Main Component
const SettingsPage = () => {
  const dispatch = useDispatch();
  const { company, settings, isLoading } = useSelector((s) => s.company);
  const { user } = useSelector((s) => s.auth);

  const canEdit = user?.role === "admin";
  const [activeNav, setActiveNav] = useState("company");
  const [companySaved, setCompanySaved] = useState(false);
  const [currencySaved, setCurrencySaved] = useState(false);
  const [mpesaSaved, setMpesaSaved] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "",
    website: "", slug: "", currency: "KES", currency_symbol: "KSh", deposit_percentage: 70,
  });
  const [mpesaForm, setMpesaForm] = useState({ accept_mpesa: false, mpesa_shortcode: "" });

  useEffect(() => { dispatch(fetchCompany()); dispatch(fetchSettings()); }, [dispatch]);
  useEffect(() => {
    if (company) setCompanyForm((p) => ({ ...p, ...company, deposit_percentage: company.deposit_percentage ?? 70 }));
  }, [company]);
  useEffect(() => {
    if (settings) setMpesaForm({ accept_mpesa: settings.accept_mpesa || false, mpesa_shortcode: settings.mpesa_shortcode || "" });
  }, [settings]);

  /* Scroll spy */
  useEffect(() => {
    const sections = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter(Boolean);
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveNav(e.target.id); }); },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const set = (key, val) => setCompanyForm((p) => ({ ...p, [key]: val }));

  const flashSave = (setter) => { setter(true); setTimeout(() => setter(false), 2000); };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateCompany({ ...companyForm, deposit_percentage: Number(companyForm.deposit_percentage) }));
    if (updateCompany.fulfilled.match(res)) { toast.success("Company updated"); flashSave(setCompanySaved); }
    else toast.error(res.payload || "Update failed");
  };

  const handleCurrencySubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateCompany({ ...companyForm, deposit_percentage: Number(companyForm.deposit_percentage) }));
    if (updateCompany.fulfilled.match(res)) { toast.success("Currency & deposits updated"); flashSave(setCurrencySaved); }
    else toast.error(res.payload || "Update failed");
  };

  const handleMpesaSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateSettings(mpesaForm));
    if (updateSettings.fulfilled.match(res)) { toast.success("M-Pesa settings updated"); flashSave(setMpesaSaved); }
    else toast.error(res.payload || "Update failed");
  };

  const handleMpesaShortcode = (v) => setMpesaForm((p) => ({ ...p, mpesa_shortcode: v.replace(/[^0-9]/g, "") }));

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "platform_admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40";
      default:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40";
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      {/*  STYLES  */}
      <style>{`
        html { scroll-behavior: smooth; }
        .sidebar-link { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .sidebar-link:hover { transform: translateX(2px); }
        .mpesa-panel { transition: max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease; overflow:hidden; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/*SIDEBAR */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-stone-200/70 bg-white/80 backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-900/80 lg:block">
        <div className="flex h-full flex-col px-4 py-8">
          {/* Sidebar Header with orange accent */}
          <div className="mb-8 px-2">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c]" />
              <h2 className="text-[15px] font-bold text-stone-900 dark:text-stone-50">Settings</h2>
            </div>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 pl-[18px]">Configure your workspace</p>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`sidebar-link group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium
                    ${activeNav === item.id
                      ? "bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-lg shadow-orange-600/20 dark:shadow-orange-900/30"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                  {activeNav === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                </button>
              );
            })}
          </nav>

          {/* Role badge */}
          <div className="mt-auto rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] text-xs font-bold text-white shadow-md shadow-orange-600/15 dark:shadow-orange-600/10">
                {user?.role?.[0]?.toUpperCase() || "V"}
              </div>
              <div>
                <p className="text-[12px] font-bold text-stone-700 dark:text-stone-300 capitalize">{user?.role || "viewer"}</p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500">{canEdit ? "Full access" : "Read only"}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TAB BAR */}
      <div className="fixed top-0 left-0 right-0 z-30 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-900/80 lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-3 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all duration-200
                  ${activeNav === item.id
                    ? "bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-md shadow-orange-600/20"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/*  MAIN CONTENT  */}
      <main className="min-w-0 flex-1 px-4 pt-20 pb-20 sm:px-8 lg:px-12 lg:pt-8">
        <div className="mx-auto max-w-2xl space-y-8">

          {/* ── Page Header ── */}
          <div className="flex items-end justify-between" style={{ opacity:0, transform:"translateY(12px)", animation:"fadeUp 0.5s 0ms cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                Manage your company profile, payments, and access control.
              </p>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getRoleColor(user?.role)}`}>
              <ShieldCheck className="w-3 h-3" />
              <span className="capitalize">{user?.role?.replace("_", " ")}</span>
            </span>
          </div>

          {/* COMPANY INFO */}
          <Section id="company" delay={60}>
            <form onSubmit={handleCompanySubmit} className="space-y-5">
              <Card
                headerProps={{ icon: Building2, title: "Company Information", description: "Basic details about your business" }}
              >
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField label="Company Name" placeholder="Acme Ltd" leftIcon={Building2} value={companyForm.name} onChange={(e) => set("name", e.target.value)} disabled={!canEdit} />
                    <InputField label="Email" type="email" placeholder="info@acme.co.ke" leftIcon={Mail} value={companyForm.email} onChange={(e) => set("email", e.target.value)} disabled={!canEdit} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField label="Phone" type="tel" placeholder="+254 700 000 000" leftIcon={Phone} value={companyForm.phone} onChange={(e) => set("phone", e.target.value)} disabled={!canEdit} />
                    <InputField label="Website" type="url" placeholder="https://acme.co.ke" leftIcon={Globe} value={companyForm.website} onChange={(e) => set("website", e.target.value)} disabled={!canEdit} />
                  </div>
                  <InputField label="Address" placeholder="123 Kenyatta Avenue, Nairobi" leftIcon={MapPin} value={companyForm.address} onChange={(e) => set("address", e.target.value)} disabled={!canEdit} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField label="City" placeholder="Nairobi" leftIcon={MapPin} value={companyForm.city} onChange={(e) => set("city", e.target.value)} disabled={!canEdit} />
                    <InputField label="Country" placeholder="Kenya" leftIcon={Globe} value={companyForm.country} onChange={(e) => set("country", e.target.value)} disabled={!canEdit} />
                  </div>
                  <InputField label="Slug" placeholder="acme-ltd" leftIcon={Link} value={companyForm.slug} onChange={(e) => set("slug", e.target.value)} disabled={!canEdit} hint="Used in URLs — letters, numbers, and hyphens only" />
                </div>
              </Card>
              <SaveButton isLoading={isLoading} saved={companySaved} disabled={!canEdit}>
                {companySaved ? "Saved!" : "Save Company"}
              </SaveButton>
            </form>
          </Section>

          {/* CURRENCY & DEPOSITS */}
          <Section id="currency" delay={120}>
            <form onSubmit={handleCurrencySubmit} className="space-y-5">
              <Card
                headerProps={{ icon: Coins, title: "Currency & Deposits", description: "Pricing rules and deposit requirements" }}
              >
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField label="Currency" value={companyForm.currency} onChange={(e) => set("currency", e.target.value)} disabled={!canEdit}>
                      <option value="KES">KES — Kenyan Shilling</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="UGX">UGX — Ugandan Shilling</option>
                      <option value="TZS">TZS — Tanzanian Shilling</option>
                    </SelectField>
                    <InputField label="Symbol" placeholder="KSh" value={companyForm.currency_symbol} onChange={(e) => set("currency_symbol", e.target.value)} disabled={!canEdit} hint="Shown on invoices and quotes" />
                  </div>
                  <DepositSlider value={companyForm.deposit_percentage} onChange={(v) => set("deposit_percentage", v)} disabled={!canEdit} />
                </div>
              </Card>
              <SaveButton isLoading={isLoading} saved={currencySaved} disabled={!canEdit}>
                {currencySaved ? "Saved!" : "Save Currency & Deposits"}
              </SaveButton>
            </form>
          </Section>

          {/* M-PESA*/}
          <Section id="mpesa" delay={180}>
            <form onSubmit={handleMpesaSubmit} className="space-y-5">
              <Card
                headerProps={{ icon: Smartphone, title: "M-Pesa Payments", description: "Safaricom M-Pesa integration" }}
              >
                <div className="space-y-4">
                  <Toggle
                    label="Accept M-Pesa"
                    checked={mpesaForm.accept_mpesa}
                    onChange={(v) => setMpesaForm((p) => ({ ...p, accept_mpesa: v }))}
                    disabled={!canEdit}
                  />

                  <div
                    className="mpesa-panel"
                    style={{
                      maxHeight: mpesaForm.accept_mpesa ? "130px" : "0px",
                      opacity: mpesaForm.accept_mpesa ? 1 : 0,
                    }}
                  >
                    <InputField
                      label="Paybill / Till Number"
                      placeholder="174379"
                      value={mpesaForm.mpesa_shortcode}
                      onChange={(e) => handleMpesaShortcode(e.target.value)}
                      disabled={!canEdit}
                      hint="Your Safaricom M-Pesa business shortcode"
                      maxLength={10}
                    />
                  </div>

                  {!mpesaForm.accept_mpesa && (
                    <div className="flex items-start gap-2.5 px-3.5 py-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/40 rounded-xl">
                      <Smartphone className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-medium leading-relaxed">
                        Toggle above to enable and configure M-Pesa payments.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
              <SaveButton isLoading={isLoading} saved={mpesaSaved} disabled={!canEdit}>
                {mpesaSaved ? "Saved!" : "Save M-Pesa Settings"}
              </SaveButton>
            </form>
          </Section>

          {/* ACCESS CONTROL*/}
          <Section id="access" delay={240}>
            <Card
              headerProps={{ icon: ShieldCheck, title: "Access Control", description: "Role-based permission overview" }}
            >
              <div className="space-y-4">
                {/* Status banner */}
                <div
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-colors duration-300 ${
                    canEdit
                      ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                      : "border-[#c2410c]/15 bg-[#fff7ed]/60 dark:border-[#c2410c]/10 dark:bg-[#c2410c]/5"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                      canEdit
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-[#fff7ed] text-[#c2410c] dark:bg-[#c2410c]/10 dark:text-orange-400"
                    }`}
                  >
                    {canEdit ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${canEdit ? "text-emerald-800 dark:text-emerald-300" : "text-[#c2410c] dark:text-orange-400"}`}>
                      {canEdit ? "Full Administrative Access" : "View-Only Access"}
                    </p>
                    <p className={`mt-1 text-[12px] leading-relaxed ${canEdit ? "text-emerald-600/70 dark:text-emerald-400/60" : "text-[#c2410c]/70 dark:text-orange-400/60"}`}>
                      {canEdit
                        ? "You can modify all settings on this page. Changes take effect across your workspace."
                        : "Only users with the admin role can modify these settings. Contact your administrator to request changes."}
                    </p>
                  </div>
                </div>

                {/* Permissions table */}
                <div className="overflow-hidden rounded-xl border border-stone-100 dark:border-stone-800">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-800/30">
                        <th className="px-4 py-2.5 text-left font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Permission</th>
                        <th className="px-4 py-2.5 text-center font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Admin</th>
                        <th className="px-4 py-2.5 text-center font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Viewer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                      {[
                        ["Edit company info", true, false],
                        ["Change currency", true, false],
                        ["Set deposit %", true, false],
                        ["Configure M-Pesa", true, false],
                        ["View all settings", true, true],
                      ].map(([label, admin, viewer]) => (
                        <tr key={label} className="transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                          <td className="px-4 py-2.5 font-medium text-stone-700 dark:text-stone-300">{label}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-block h-4 w-4 rounded-full ${admin ? "bg-emerald-400 dark:bg-emerald-500" : "bg-stone-200 dark:bg-stone-700"}`} />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-block h-4 w-4 rounded-full ${viewer ? "bg-emerald-400 dark:bg-emerald-500" : "bg-stone-200 dark:bg-stone-700"}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </Section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;