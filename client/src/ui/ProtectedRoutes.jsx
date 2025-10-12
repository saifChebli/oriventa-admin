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
  // If user is not authenticated, redirect to login first
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Then enforce role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to a safe default depending on role; default is root
    return <Navigate to="/" replace />; // redirect if role not allowed
  }

  return <Outlet />;
};

export default ProtectedRoute;
