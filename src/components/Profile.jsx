import { fetchProfile, updateProfile } from "@/slices/profileSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Profile = () => {
  const dispatch = useDispatch();

  const { profile, loading, error, updateLoading, updateError } =
    useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    phone: "",
  });
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
  };

  if (loading) {
    return (
      <div className="text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-emerald-600">
          My Profile
        </h2>
        <p className="text-gray-500">
          Manage your account information.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
        {profile && (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-semibold">
              {profile.first_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">
                {profile.first_name}
              </p>
              <p className="text-sm text-gray-500">
                {profile.email}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}
        {profile && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name
              </label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg
                border-gray-300
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg
                border-gray-300
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg
                border-gray-300
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Role
              </label>

              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full px-3 py-2 border rounded-lg
                bg-gray-100
                border-gray-300
                cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={updateLoading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {updateLoading ? "Updating..." : "Update Profile"}
            </button>
            {updateError && (
              <div className="text-red-500 text-sm">
                {typeof updateError === "string"
                  ? updateError
                  : Object.entries(updateError).map(([key, value]) => (
                      <p key={key}>
                        {key}: {value}
                      </p>
                    ))}
              </div>
            )}

          </form>
        )}

      </div>
    </div>
  );
};

export default Profile;