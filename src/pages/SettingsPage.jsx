import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompany,
  updateCompany,
  fetchSettings,
  updateSettings,
} from "@/store/slices/companySlice";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { company, settings, isLoading } = useSelector(
    (state) => state.company
  );
  const { user } = useSelector((state) => state.auth);

  const isCompanyAdmin = user?.role === "admin";
  const canEdit = isCompanyAdmin;

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    slug: "",
    currency: "KES",
    currency_symbol: "KSh",
    deposit_percentage: 70,
  });

  const [mpesaForm, setMpesaForm] = useState({
    accept_mpesa: false,
    mpesa_shortcode: "",
  });

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
        slug: company.slug || "",
        currency: company.currency || "KES",
        currency_symbol: company.currency_symbol || "KSh",
        deposit_percentage: company.deposit_percentage ?? 70,
      });
    }
  }, [company]);

  useEffect(() => {
    if (settings) {
      setMpesaForm({
        accept_mpesa: settings.accept_mpesa || false,
        mpesa_shortcode: settings.mpesa_shortcode || "",
      });
    }
  }, [settings]);

  // -------- COMPANY SAVE (currency + deposit included) ----------
  const handleCompanySubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...companyForm,
      deposit_percentage: Number(companyForm.deposit_percentage),
    };

    const res = await dispatch(updateCompany(payload));

    if (updateCompany.fulfilled.match(res)) {
      toast.success("Company updated");
    } else {
      toast.error(res.payload || "Update failed");
    }
  };

  // -------- M-PESA SAVE ----------
  const handleMpesaSubmit = async (e) => {
    e.preventDefault();

    const res = await dispatch(updateSettings(mpesaForm));

    if (updateSettings.fulfilled.match(res)) {
      toast.success("M-Pesa settings updated");
    } else {
      toast.error(res.payload || "Update failed");
    }
  };

  const handleMpesaShortcode = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setMpesaForm((prev) => ({
      ...prev,
      mpesa_shortcode: cleaned,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* ---------------- COMPANY FORM ---------------- */}
      <form onSubmit={handleCompanySubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">

        <h2 className="font-semibold text-lg">Company Info</h2>

        <input
          type="text"
          placeholder="Company Name"
          value={companyForm.name}
          onChange={(e) =>
            setCompanyForm({ ...companyForm, name: e.target.value })
          }
          disabled={!canEdit}
          className="input"
        />

        <input
          type="email"
          placeholder="Email"
          value={companyForm.email}
          onChange={(e) =>
            setCompanyForm({ ...companyForm, email: e.target.value })
          }
          disabled={!canEdit}
          className="input"
        />

        {/* -------- Currency -------- */}
        <div>
          <label className="block text-sm mb-1">Currency</label>
          <select
            value={companyForm.currency}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, currency: e.target.value })
            }
            disabled={!canEdit}
            className="input"
          >
            <option value="KES">KES</option>
            <option value="USD">USD</option>
            <option value="UGX">UGX</option>
            <option value="TZS">TZS</option>
          </select>
        </div>

        {/* -------- Deposit -------- */}
        <div>
          <label className="block text-sm mb-1">Deposit Percentage</label>
          <input
            type="number"
            min="0"
            max="100"
            value={companyForm.deposit_percentage}
            onChange={(e) =>
              setCompanyForm({
                ...companyForm,
                deposit_percentage: Math.min(
                  100,
                  Math.max(0, Number(e.target.value))
                ),
              })
            }
            disabled={!canEdit}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? "Saving..." : "Save Company"}
        </button>
      </form>

      {/* ---------------- M-PESA ---------------- */}
      <form onSubmit={handleMpesaSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">

        <h2 className="font-semibold text-lg">M-Pesa</h2>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={mpesaForm.accept_mpesa}
            onChange={() =>
              setMpesaForm((prev) => ({
                ...prev,
                accept_mpesa: !prev.accept_mpesa,
              }))
            }
            disabled={!canEdit}
          />
          Accept M-Pesa
        </label>

        {mpesaForm.accept_mpesa && (
          <input
            type="text"
            placeholder="Shortcode"
            value={mpesaForm.mpesa_shortcode}
            onChange={(e) => handleMpesaShortcode(e.target.value)}
            className="input"
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? "Saving..." : "Save M-Pesa"}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;