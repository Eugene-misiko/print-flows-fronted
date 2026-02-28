import { fetchProfile, updateProfile } from '@/slices/profileSlice';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Profile = () => {
    const dispatch = useDispatch();
    const {profile, loading, error,updateLoading,updateError} = useSelector((state)=>state.profile)
    const [formData, setFormData] = useState({username: "", email: "", phone: ""})
    useEffect(()=> {dispatch(fetchProfile());}, [dispatch]);

    useEffect(()=>{
        if(profile){
            setFormData({
                username: profile.username || "",
                email: profile.email || "",
                phone: profile.phone || "",
            })
        }
    }, [profile]);
 const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
 };

 const handleSubmit = (e)=>{
    e.preventDefault();
    dispatch(updateProfile(formData));
 }
  return (
    <div>
      <h2>User Profile</h2>
      {loading && <p>Loading profile...</p>}
      {error && <p>{error}</p>}
      {profile &&(
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input type="text" name="username"
                 value={formData.username}
                  onChange={handleChange} />
            
            <label htmlFor="email">Email:</label>
              <input type="email" 
              name="email" value={formData.email}
              onChange={handleChange} />
              </div>
                        <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
                    <div>
            <label>Role:</label>
            <input
              type="text"
              value={profile.role}
              disabled
            />
          </div>
          <button type="submit" disabled={updateLoading}>
            {updateLoading ? "Updating..." : "Update Profile"}
          </button>
          {updateError && <p style={{ color: "red" }}>{updateError}</p>}
        </form>
      )}
    </div>
  )
}

export default Profile
