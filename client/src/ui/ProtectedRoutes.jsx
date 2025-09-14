import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mt-6 flex justify-center items-center">
        <div className="border-4 w-10 h-10 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  console.log(allowedRoles)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // redirect if role not allowed
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
