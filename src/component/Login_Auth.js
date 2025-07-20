import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthCheck() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // 저장된 JWT 토큰 가져오기
    if (!token) {
      setIsAuthenticated(false);
      navigate("/Main_page"); // 로그인 페이지로 이동
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  return isAuthenticated ? <p>인증됨</p> : <p>인증되지 않음</p>;
}

export default AuthCheck;
