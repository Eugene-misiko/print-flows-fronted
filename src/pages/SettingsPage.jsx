import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompany, updateCompany, fetchSettings, updateSettings } from "@/store/slices/companySlice";
import toast from "react-hot-toast";
import { Building2, Settings, Save, Globe, MapPin, Coins, ShieldCheck, Lock, ChevronRight } from "lucide-react";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { company, settings, isLoading } = useSelector((state) => state.company);
  const { user } = useSelector((state) => state.auth);

  const [companyForm, setCompanyForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "",
    slug: "", website: "", currency: "KES", currency_symbol: "KSh",
    deposit_percentage: 70, subdomain: "", custom_domain: "",
  });

  const [settingsForm, setSettingsForm] = useState({ deposit_percentage: 70, currency: "KES" });

  const isPlatformAdmin = user?.role === "platform_admin";
  const isCompanyAdmin = user?.role === "admin";
  const canEditCompany = isCompanyAdmin;
  const canEditPlatform = isPlatformAdmin;

  useEffect(() => { dispatch(fetchCompany()); dispatch(fetchSettings()); }, [dispatch]);

  useEffect(() => {
    if (company) setCompanyForm({
      name: company.name || "", email: company.email || "", slug: company.slug || "",
      phone: company.phone || "", address: company.address || "", city: company.city || "",
      country: company.country || "", website: company.website || "", currency: company.currency || "KES",
      currency_symbol: company.currency_symbol || "KSh", deposit_percentage: company.deposit_percentage || 70,
      subdomain: company.subdomain || "", custom_domain: company.custom_domain || "",
    });
  }, [company]);

  useEffect(() => {
    if (settings) setSettingsForm({ deposit_percentage: settings.deposit_percentage || 70, currency: settings.currency || "KES" });
  }, [settings]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const r = await dispatch(updateCompany(companyForm));
    updateCompany.fulfilled.match(r) ? toast.success("Company updated") : toast.error(r.payload || "Failed to update");
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const r = await dispatch(updateSettings(settingsForm));
    updateSettings.fulfilled.match(r) ? toast.success("Settings saved") : toast.error(r.payload || "Failed to save");
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const labelCls = "block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5";
  const hintCls = "text-[11px] text-stone-400 dark:text-stone-500 mt-1.5";
  const disabledNote = (text) => canEditCompany ? null : <p className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 mt-1.5"><Lock className="w-3 h-3" />{text}</p>;

  const SectionDivider = ({ label, icon: Icon }) => (
    <div className="flex items-center gap-2.5 pt-5 first:pt-0">
      <div className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
      </div>
      <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-stone-100 dark:bg-stone-800" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">Manage your company and business preferences</p>
        </div>
        {!canEditCompany && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-semibold text-stone-500 dark:text-stone-400">
            <Lock className="w-3.5 h-3.5" />View Only
          </span>
        )}
      </div>

      {/* Company Information */}
      <form onSubmit={handleCompanySubmit} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#c2410c]" />
            </div>
            Company Information
          </h2>
          <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            {isCompanyAdmin ? "Editable" : "Read only"}
          </span>
        </div>

        <div className="p-6 space-y-1 flex-1">
          <SectionDivider label="Basic Details" icon={Building2} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div>
              <label className={labelCls}>Company Name</label>
              <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} disabled={!canEditCompany} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} disabled={!canEditCompany} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} disabled={!canEditCompany} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Currency Symbol</label>
              <input type="text" value={companyForm.currency_symbol} onChange={(e) => setCompanyForm({ ...companyForm, currency_symbol: e.target.value })} disabled={!canEditPlatform} className={inputCls} />
              {disabledNote("Platform admins only")}
            </div>
          </div>

          <SectionDivider label="Location" icon={MapPin} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>Street Address</label>
              <textarea value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} disabled={!canEditCompany} rows={2} className={inputCls + " resize-none"} />
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} disabled={!canEditCompany} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input type="text" value={companyForm.country} onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })} disabled={!canEditCompany} className={inputCls} />
              </div>
            </div>
          </div>

          <SectionDivider label="Web & Domain" icon={Globe} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div>
              <label className={labelCls}>Website</label>
              <input type="text" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} disabled={!canEditCompany} placeholder="https://" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company Slug</label>
              <input type="text" value={companyForm.slug} onChange={(e) => setCompanyForm({ ...companyForm, slug: e.target.value })} disabled={!canEditCompany} className={inputCls} />
              <p className={hintCls}>Used in URLs and references</p>
            </div>
            <div>
              <label className={labelCls}>Subdomain</label>
              <div className="relative">
                <input type="text" value={companyForm.subdomain} onChange={(e) => setCompanyForm({ ...companyForm, subdomain: e.target.value })} disabled={!canEditPlatform} className={inputCls + " pr-24"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 dark:text-stone-500 font-medium pointer-events-none">.printshop.app</span>
              </div>
              {disabledNote("Platform admins only")}
            </div>
            <div>
              <label className={labelCls}>Custom Domain</label>
              <input type="text" value={companyForm.custom_domain} onChange={(e) => setCompanyForm({ ...companyForm, custom_domain: e.target.value })} disabled={!canEditPlatform} placeholder="app.yourdomain.com" className={inputCls} />
              {disabledNote("Platform admins only")}
            </div>
          </div>
        </div>

        {canEditCompany && (
          <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 rounded-b-2xl">
            <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-50">
              <Save className="w-4 h-4" />{isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Rules */}
        <form onSubmit={handleSettingsSubmit} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b border-stone-100 dark:border-stone-800">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
                <Coins className="w-4 h-4 text-[#c2410c]" />
              </div>
              Business Rules
            </h2>
          </div>

          <div className="p-6 space-y-5 flex-1">
            <div>
              <label className={labelCls}>Default Currency</label>
              <select value={settingsForm.currency} onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })} disabled={!canEditCompany} className={inputCls + " appearance-none"}>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
              </select>
              <p className={hintCls}>Applied to all new orders</p>
            </div>

            <div>
              <label className={labelCls}>Deposit Required (%)</label>
              <div className="relative">
                <input type="number" min="0" max="100" value={settingsForm.deposit_percentage} onChange={(e) => setSettingsForm({ ...settingsForm, deposit_percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} disabled={!canEditCompany} className={inputCls + " pr-10"} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-semibold pointer-events-none">%</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className={hintCls + " !mt-0"}>Required before work begins</p>
                <span className="text-xs font-bold text-[#c2410c] tabular-nums">{settingsForm.deposit_percentage}%</span>
              </div>
              <div className="mt-2.5 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-full transition-all duration-300" style={{ width: `${settingsForm.deposit_percentage}%` }} />
              </div>
            </div>
          </div>

          {canEditCompany && (
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 rounded-b-2xl">
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-50">
                <Save className="w-4 h-4" />{isLoading ? "Saving..." : "Save Rules"}
              </button>
            </div>
          )}
        </form>

        {/* Platform Config — only visible to platform admins */}
        {isPlatformAdmin ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                Platform Config
              </h2>
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200/60 dark:border-purple-800/30 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Platform Admin Access</p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 leading-relaxed">
                    You have elevated access to configure subdomains, custom domains, and currency symbols. These settings affect all companies on the platform.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Subdomain management", desc: "Assign custom subdomains" },
                  { label: "Custom domain mapping", desc: "CNAME & SSL configuration" },
                  { label: "Currency override", desc: "Set per-company symbols" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-3.5 py-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{item.label}</p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder card for non-platform-admins to keep grid balanced */
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3">
              <Settings className="w-6 h-6 text-stone-300 dark:text-stone-600" />
            </div>
            <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">Platform Configuration</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 max-w-[220px] leading-relaxed">
              Advanced platform settings are available to platform administrators only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;