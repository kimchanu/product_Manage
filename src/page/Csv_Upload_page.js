import Header from "../layout/Header";
import Footer from "../layout/Footer";
import React, { useState, useEffect } from "react";
import Search_select from "../component/Selector/Search_select";
import ExcelUpload from "../component/Excel/ExcelUpload";

import { jwtDecode } from "jwt-decode"; // ✅ 중괄호 추가

function Csv_Upload() {
  const [businessLocation, setBusinessLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [username, setUsername] = useState(""); // 사용자 이름 저장

  // ✅ 토큰에서 사용자 이름 추출
  useEffect(() => {
    const token = localStorage.getItem("authToken"); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // 토큰 디코딩
        console.log("🔹 디코딩된 토큰:", decodedToken); // ✅ 디버깅용 콘솔 로그 추가
        setUsername(decodedToken.full_name || ""); // 사용자 이름 설정
      } catch (error) {
        console.error("⚠ 토큰 디코딩 오류:", error);
      }
    } else {
      console.warn("⚠ 토큰이 로컬 스토리지에 없습니다.");
    }
  }, []);

  // 백엔드로 데이터 전송
  const handleSave = async () => {
    if (!businessLocation || !department) {
      alert("사업소와 부서를 선택해주세요!");
      return;
    }

    if (csvData.length === 0) {
      alert("CSV 파일을 업로드해주세요!");
      return;
    }

    if (!username) {
      alert("사용자 정보를 불러올 수 없습니다.");
      return;
    }

    const requestData = {
      businessLocation,
      department,
      username, // ✅ 사용자 이름 추가
      csvData,
    };

    console.log("🔹 서버로 전송할 데이터:", requestData);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // ✅ 토큰 포함
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        // 성공 시 입력 필드 초기화
        setCsvData([]);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("⚠ 서버 요청 실패:", error);
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <Header />
      {/* 사업소 & 부서 선택 */}
      <Search_select
        setBusinessLocation={setBusinessLocation}
        setDepartment={setDepartment}
      />
      {/* CSV 업로드 */}
      <ExcelUpload setCsvData={setCsvData} />

      {/* 저장 버튼 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          저장하기
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Csv_Upload;