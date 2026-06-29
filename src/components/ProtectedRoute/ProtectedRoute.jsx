import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole) {
      alert("Bạn không có quyền truy cập trang Admin!");
      navigate('/', { replace: true });
    }
  }, [user, requiredRole, navigate]);

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Return null to allow useEffect to redirect
    return null;
  }

  return children;
};

export default ProtectedRoute;
