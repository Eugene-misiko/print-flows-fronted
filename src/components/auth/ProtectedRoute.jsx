import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const token = localStorage.getItem("access_token");

  //Not logged in
  if (!token || !isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //  Role restriction (if provided)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && !user.is_platform_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;