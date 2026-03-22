import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { acceptInvitation, clearError } from "@/store/slices/authslice";
import { Printer, Lock, Eye, EyeOff, User, CheckCircle } from "lucide-react";
import toast from "react-toastify";

const AcceptInvitation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error } = useSelector((state) => state.auth);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    full_name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid invitation link");
      navigate("/login");
    }
  }, [token, email, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const result = await dispatch(acceptInvitation({
      token,
      password: formData.password,
      full_name: formData.full_name,
    }));

    if (acceptInvitation.fulfilled.match(result)) {
      toast.success("Account activated successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.payload || "Failed to accept invitation");
    }
  };