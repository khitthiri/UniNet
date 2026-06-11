import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-base-200"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  if (!user) return <Navigate to="/welcome" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
