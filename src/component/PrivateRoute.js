import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const getDecodedToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  if (isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    return null;
  }

  try {
    return jwtDecode(token);
  } catch (error) {
    localStorage.removeItem("authToken");
    return null;
  }
};

const PrivateRoute = ({ requiredAdminLevel = 0 }) => {
  const decoded = getDecodedToken();

  if (!decoded) {
    return <Navigate to="/Login_page" replace />;
  }

  const adminLevel = Number(decoded.admin || 0);

  if (adminLevel < requiredAdminLevel) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
