import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// 토큰 만료 체크 함수
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // 토큰 디코딩 실패 시 만료된 것으로 처리
  }
};

// 로그인 여부 확인 함수
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  // 토큰 만료 체크
  if (isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    return false;
  }

  return true;
};

// 보호된 라우트 컴포넌트
const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/Login_page" replace />;
};

export default PrivateRoute;
