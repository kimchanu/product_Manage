import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

function User_info({ setUser }) {
  const [userInfo, setUserInfo] = useState(null);

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
 
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // 토큰 만료 체크
      if (isTokenExpired(token)) {
        console.log("토큰이 만료되었습니다. 자동 로그아웃 처리");
        localStorage.removeItem("authToken");
        window.location.href = "/login_page"; // 로그인 페이지로 리다이렉트
        return;
      }

      try {
        const decoded = jwtDecode(token);
        // console.log("Decoded token:", decoded);

        // 사업소명을 코드로 변환
        let business_location_code = "";
        switch (decoded.business_location) {
          case "GK사업소":
            business_location_code = "GK";
            break;
          case "천마사업소":
            business_location_code = "CM";
            break;
          case "을숙도사업소":
            business_location_code = "ES";
            break;
          default:
            business_location_code = decoded.business_location;
        }

        const userData = {
          user_id: decoded.id,
          name: decoded.full_name,
          business_location: business_location_code,
          department: decoded.department,
          admin: decoded.admin
        };

        console.log("Processed user data:", userData);
        setUserInfo(userData);
        if (setUser) {
          setUser(userData);
        }
      } catch (error) {
        console.error("토큰 디코딩 오류:", error);
        localStorage.removeItem("authToken");
        window.location.href = "/login_page";
      }
    }
  }, [setUser]);

  return null;
}

export default User_info;
