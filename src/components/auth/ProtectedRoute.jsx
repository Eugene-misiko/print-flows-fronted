import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Printer } from "lucide-react";

const FullPageLoader = ({ message }) => (
  <div className="fixed inset-0 z-[9999] bg-[#f5f0eb] flex flex-col items-center justify-center gap-5">
  
    <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-orange-300/15 rounded-full blur-[100px]" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-300/15 rounded-full blur-[100px]" />

    <div className="relative">
      <div className="absolute inset-0 w-[72px] h-[72px] bg-gradient-to-br from-[#e8620a] to-[#c93d1a] rounded-2xl animate-ping opacity-20" />
      <div className="relative w-[72px] h-[72px] bg-gradient-to-br from-[#e8620a] to-[#c93d1a] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-300/30">
        <Printer className="w-8 h-8 text-white" />
      </div>
    </div>

    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 bg-[#e8620a] rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-[#e8620a] rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-[#e8620a] rounded-full animate-bounce [animation-delay:300ms]" />
    </div>

    <p className="text-[14px] text-[#8a8279] font-medium">{message}</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  const token = localStorage.getItem("access_token");

  if (isLoading) return <FullPageLoader message="Loading..." />;

  if (!token) return <Navigate to="/login" replace />;

  if (!user) return <FullPageLoader message="Loading session..." />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;