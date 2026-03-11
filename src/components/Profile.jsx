import { fetchProfile, updateProfile } from "@/slices/profileSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const Profile = () => {
  const dispatch = useDispatch();

  const { profile, loading, error, updateLoading, updateError } = useSelector(
    (state) => state.profile
  );
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
      <div className="ml-56 mt-24 p-8">
        <p className="text-zinc-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }
  return (
    <div className="ml-56 mt-24 p-8">
      <div className="max-w-xl mx-auto">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-rose-600">
              My Profile
            </h2>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>)}
            {profile && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md
                    border-zinc-300 dark:border-zinc-700
                    bg-white dark:bg-zinc-900
                    focus:ring-2 focus:ring-rose-500 outline-none"/>
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
                    className="w-full px-3 py-2 border rounded-md
                    border-zinc-300 dark:border-zinc-700
                    bg-white dark:bg-zinc-900
                    focus:ring-2 focus:ring-rose-500 outline-none"
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
                    className="w-full px-3 py-2 border rounded-md
                    border-zinc-300 dark:border-zinc-700
                    bg-white dark:bg-zinc-900
                    focus:ring-2 focus:ring-rose-500 outline-none"
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
                    className="w-full px-3 py-2 border rounded-md
                    bg-zinc-200 dark:bg-zinc-800
                    border-zinc-300 dark:border-zinc-700
                    cursor-not-allowed"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  {updateLoading ? "Updating..." : "Update Profile"}
                </Button>
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
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Profile;