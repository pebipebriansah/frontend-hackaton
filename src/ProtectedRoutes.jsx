import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token'); // Ganti 'token' sesuai penyimpananmu

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
