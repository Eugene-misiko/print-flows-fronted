import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  const token = localStorage.getItem("access_token");

  if (isLoading) return <div>Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  if (!user) return <div>Loading session...</div>;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;