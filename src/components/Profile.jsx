import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from "@/slices/profileSlice";
import { Pencil } from "lucide-react"; // small pencil icon
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
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (imageFile) data.append("avatar", imageFile);

    dispatch(updateProfile(data));
    setEditing(false);
    setImageFile(null);
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
    <div className="max-w-md bg-slate-900/30 shadow rounded p-6 space-y-6 mt-10 mx-auto">
      <div className="flex items-center gap-4 relative">
        <div className="relative w-16 h-16 mx-auto">
          <img
            src={imagePreview}
            alt={profile.first_name || "Profile"}
            className="w-full h-full rounded-full object-cover border-2 border-white shadow  cursor-pointer"
            onClick={() => editing && document.getElementById("avatarInput").click()}
          />
          {editing && (
            <div
              className="absolute bottom-0 right-0 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("avatarInput").click();
              }}>
              <Pencil className="w-3 h-3" />
            </div>
          )}
          <input
            type="file"
            id="avatarInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div>
          <p className="font-semibold">{profile.first_name}</p>
          <p className="text-gray-800 text-sm">{profile.email}</p>
        </div>

        {!editing && (
          <button
            className="ml-auto px-3 py-1 bg-white/70 backdrop-blur rounded-lg text-emerald-600 hover:bg-white transition"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
        {editing && (
          <button
            className="ml-auto px-3 py-1 bg-white/70 backdrop-blur rounded-lg text-red-700 hover:bg-white transition"
            onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <InputField
            label="Last name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />          
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={updateLoading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60">
            {updateLoading ? "Updating..." : "Save Profile"}
          </button>
          {updateError && (
            <p className="text-red-500 text-sm">
              {typeof updateError === "string"
                ? updateError
                : JSON.stringify(updateError)}
            </p>
          )}
        </form>
      )}

      {/* Display Info */}
      {!editing && (
        <div className="space-y-2 text-gray-700">
          <p>Name: {profile.first_name}</p>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>
          <p>Role: {profile.role}</p>
        </div>
      )}
    </div>
  );
};

// Input Field Component
const InputField = ({ label, name, value, onChange, type = "text", disabled }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg ${
        disabled
          ? "bg-gray-100 border-gray-300 cursor-not-allowed"
          : "w-full bg-secondary text-foreground text-sm font-mono px-3 py-2 rounded border border-subtle focus:outline-none focus:border-primary transition-colors"
      }`}
    />
  </div>
);

export default ProfileCard;