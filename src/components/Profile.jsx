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
      
    </div>
  )
}

export default Profile
