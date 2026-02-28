import { fetchProfile, updateProfile } from '@/slices/profileSlice';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error, updateLoading, updateError } = useSelector((state) => state.profile);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: ""
  });
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
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

  return (
    <div className="min-h-screen flex justify-center items-start py-10 px-4 bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          User Profile
        </h2>

        {loading && <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {profile && (
          <form onSubmit={handleSubmit} className="space-y-5">

           
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md 
                           bg-white dark:bg-gray-700 
                           border-gray-300 dark:border-gray-600 
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md 
                           bg-white dark:bg-gray-700 
                           border-gray-300 dark:border-gray-600 
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

           
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md 
                           bg-white dark:bg-gray-700 
                           border-gray-300 dark:border-gray-600 
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

           
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full px-3 py-2 border rounded-md 
                           bg-gray-200 dark:bg-gray-600
                           border-gray-300 dark:border-gray-600 
                           text-gray-600 dark:text-gray-300
                           cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={updateLoading}
              className="w-full py-2 rounded-md font-medium 
                         bg-gray-800 hover:bg-zinc-700 
                         dark:bg-zinc-950 dark:hover:bg-zinc-900
                         text-white transition duration-200"
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