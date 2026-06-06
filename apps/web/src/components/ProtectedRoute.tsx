import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuth';

export default function ProtectedRoute() {
  const { user, token } = useAuth();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
