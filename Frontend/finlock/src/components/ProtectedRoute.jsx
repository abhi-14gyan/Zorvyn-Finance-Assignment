// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, checkingAuth } = useAuth();

  if (checkingAuth) {
    return <div className="text-center mt-20">Loading...</div>; // or a spinner
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default ProtectedRoute;
