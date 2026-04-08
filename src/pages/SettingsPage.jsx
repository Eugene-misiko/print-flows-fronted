import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompany, updateCompany, fetchSettings, updateSettings } from "@/store/slices/companySlice";
import toast from "react-hot-toast";
import { Building2, Settings, Save } from "lucide-react";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { company, settings, isLoading } = useSelector((state) => state.company);
  const { user } = useSelector((state) => state.auth);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    currency: "",
    currency_symbol: "",
    deposit_percentage: 70,
    subdomain: "",
    custom_domain: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    deposit_percentage: 70,
    currency: "KES",
  });

  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  useEffect(() => {
    dispatch(fetchCompany());
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
        website: company.website || "",
        currency: company.currency || "KES",
        currency_symbol: company.currency_symbol || "KSh",
        deposit_percentage: company.deposit_percentage || 70,
        subdomain: company.subdomain || "",
        custom_domain: company.custom_domain || "",
      });
    }
  }, [company]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        deposit_percentage: settings.deposit_percentage || 70,
        currency: settings.currency || "KES",
      });
    }
  }, [settings]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateCompany(companyForm));
    if (updateCompany.fulfilled.match(result)) {
      toast.success("Company updated");
    } else {
      toast.error(result.payload || "Failed to update");
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateSettings(settingsForm));
    if (updateSettings.fulfilled.match(result)) {
      toast.success("Settings saved");
    } else {
      toast.error(result.payload || "Failed to save");
    }
  };

  // Common input classes for consistency
  const inputClass = `w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white 
  placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors
   disabled:bg-gray-100 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your company settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Company Information
          </h2>
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                disabled={!isAdmin}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                disabled={!isAdmin}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  disabled={!isAdmin}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  disabled={!isAdmin}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                disabled={!isAdmin}
                rows="2"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subdomain
              </label>
              <input
                type="text"
                value={companyForm.subdomain}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, subdomain: e.target.value })
                }
                disabled={!isAdmin}
                className={inputClass}
                placeholder="e.g. zenith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Domain
              </label>
              <input
                type="text"
                value={companyForm.custom_domain}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, custom_domain: e.target.value })
                }
                disabled={!isAdmin}
                className={inputClass}
                placeholder="e.g. zenith.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={companyForm.currency_symbol}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, currency_symbol: e.target.value })
                }
                disabled={!isAdmin}
                className={inputClass}
              />
            </div>
            {isAdmin && (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            System Settings
          </h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settingsForm.deposit_percentage}
                onChange={(e) => setSettingsForm({ ...settingsForm, deposit_percentage: parseInt(e.target.value) })}
                disabled={!isAdmin}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default deposit required before work begins</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select
                value={settingsForm.currency}
                onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                disabled={!isAdmin}
                className={inputClass}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            {isAdmin && (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Settings"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;