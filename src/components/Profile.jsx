import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from "@/slices/profileSlice";
import { changePassword } from "@/slices/authslice"; 
import { Pencil, KeyRound, ArrowLeft } from "lucide-react"; 
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import portrait from "@/assets/portrait.png";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const { profile, loading, updateLoading, updateError } = useSelector(
    (state) => state.profile
  );
  
  // Getting password state from authSlice
  const { passwordLoading, passwordError, passwordSuccess } = useSelector(
    (state) => state.auth
  );

  const [editing, setEditing] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false); // Toggle mode
  
  const [formData, setFormData] = useState({ 
    first_name: "", last_name: "", email: "", phone: "" 
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(portrait);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);


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

  useEffect(() => {
    if (passwordSuccess) {
      toast.success(passwordSuccess);
      setChangePasswordMode(false); 
      setPasswordData({ old_password: "", new_password: "", new_password_confirm: "" });
    }
    if (passwordError) {
      const msg = typeof passwordError === 'string' ? passwordError : JSON.stringify(passwordError);
      toast.error(msg);
    }
  }, [passwordSuccess, passwordError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmitProfile = (e) => {
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

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      toast.error("New passwords do not match");
      return;
    }
    dispatch(changePassword(passwordData));
  };

  const handleCancel = () => {
    setEditing(false);
    setChangePasswordMode(false);
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
    setPasswordData({ old_password: "", new_password: "", new_password_confirm: "" });
  };

  if (loading || !profile) return <p className="text-gray-500 animate-pulse">Loading profile...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 p-6">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-slate-900 text-white relative">
        
        {/* Mode Toggle Header */}
        <div className="absolute top-4 right-4 z-10">
           {!editing && !changePasswordMode && (
             <button 
                onClick={() => setChangePasswordMode(true)}
                className="p-2 cursor-pointer bg-slate-700/50 hover:bg-slate-700 rounded-full transition" 
                title="Change Password">
                <KeyRound size={18} className="text-emerald-400" />
             </button>
           )}
        </div>
        <div className="h-28 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"></div>
        <div className={`relative flex flex-col items-center ${changePasswordMode ? '-mt-5' : '-mt-14'}`}>
          {!changePasswordMode && (
            <div className="relative w-28 h-28">
              <img
                src={imagePreview}
                className="w-full h-full object-cover rounded-full border-4 border-slate-900 shadow-lg cursor-pointer"
                onClick={() => editing && document.getElementById("avatarInput").click()}
              />
              {editing && (
                <div
                  className="absolute bottom-1 right-1 bg-emerald-600 p-2 rounded-full cursor-pointer hover:bg-emerald-700"
                  onClick={(e) => { e.stopPropagation(); document.getElementById("avatarInput").click(); }}
                >
                  <Pencil size={14} />
                </div>
              )}
              <input type="file" id="avatarInput" className="hidden" onChange={handleImageChange} />
            </div>
          )}
          
          <h2 className={`text-xl font-semibold ${changePasswordMode ? 'mt-4' : 'mt-4'}`}>
            {changePasswordMode ? "Security Settings" : `${profile.first_name} ${profile.last_name}`}
          </h2>
          {!changePasswordMode && (
            <p className="text-emerald-400 text-sm tracking-wide">{profile.role}</p>
          )}
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          
          {/* --- DEFAULT VIEW --- */}
          {!editing && !changePasswordMode && (
            <>
              <div className="text-sm text-gray-400 space-y-2 text-center">
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

          {/* --- EDIT PROFILE FORM --- */}
          {editing && !changePasswordMode && (
            <form onSubmit={handleSubmitProfile} className="space-y-3">
              <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
              <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
              <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
              <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updateLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg">
                  {updateLoading ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* --- CHANGE PASSWORD FORM --- */}
          {changePasswordMode && (
            <>
              <button 
                onClick={() => { setChangePasswordMode(false); handleCancel(); }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"
              >
                <ArrowLeft size={16} /> Back to Profile
              </button>

              <form onSubmit={handleSubmitPassword} className="space-y-3">
                <InputField 
                  label="Current Password" 
                  name="old_password" 
                  type="password"
                  value={passwordData.old_password} 
                  onChange={handlePasswordChange} 
                />
                <InputField 
                  label="New Password" 
                  name="new_password" 
                  type="password"
                  value={passwordData.new_password} 
                  onChange={handlePasswordChange} 
                />
                <InputField 
                  label="Confirm New Password" 
                  name="new_password_confirm" 
                  type="password"
                  value={passwordData.new_password_confirm} 
                  onChange={handlePasswordChange} 
                />

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={passwordLoading} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-emerald-400">
                  Forgot current password?
                </Link>
              </div>
            </>
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