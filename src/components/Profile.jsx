import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from "@/slices/profileSlice";
import { Pencil } from "lucide-react"; 
import portrait from "@/assets/portrait.png";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const { profile, loading, updateLoading, updateError } = useSelector(
    (state) => state.profile
  );
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: "",last_name: "", email: "", phone: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(portrait);

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update form and preview when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
      setImagePreview(profile.avatar || portrait);
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const data = new FormData();
  data.append("first_name", formData.first_name);
  data.append("last_name", formData.last_name); 
  data.append("email", formData.email);
  data.append("phone", formData.phone);

  if (imageFile) {
    data.append("avatar", imageFile);
  }

  dispatch(updateProfile(data));
  setEditing(false);
};

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
      setImagePreview(profile.avatar || portrait);
      setImageFile(null);
    }
  };

  if (loading || !profile) return <p className="text-gray-500 animate-pulse">Loading profile...</p>;
return (
  <div className=" min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 p-6">
    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-slate-900 text-white">

      {/* HEADER */}
      <div className="h-28 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"></div>

      {/* PROFILE IMAGE */}
      <div className="relative flex flex-col items-center -mt-14">
        <div className="relative w-28 h-28">
          <img
            src={imagePreview}
            className="w-full h-full object-cover rounded-full border-4 border-slate-900 shadow-lg cursor-pointer"
            onClick={() =>
              editing && document.getElementById("avatarInput").click()
            }
          />

          {editing && (
            <div
              className="absolute bottom-1 right-1 bg-emerald-600 p-2 rounded-full cursor-pointer hover:bg-emerald-700"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("avatarInput").click();
              }}
            >
              <Pencil size={14} />
            </div>
          )}

          <input
            type="file"
            id="avatarInput"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        {/* NAME + ROLE */}
        <h2 className="mt-4 text-xl font-semibold">
          {profile.first_name} {profile.last_name}
        </h2>
        <p className="text-emerald-400 text-sm tracking-wide">
          {profile.role}
        </p>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-4">

        {!editing && (
          <>
            <div className="text-sm text-gray-400 space-y-2">
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg transition"
            >
              Edit Profile
            </button>
          </>
        )}

        {editing && (
          <form onSubmit={handleSubmit} className="space-y-3">

            <InputField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />

            <InputField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={updateLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg"
              >
                {updateLoading ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>

            {updateError && (
              <p className="text-red-400 text-sm">{JSON.stringify(updateError)}</p>
            )}
          </form>
        )}
      </div>
    </div>
  </div>
);
};

// Input Field Component
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

export default ProfileCard;