import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

// 이미지 import
import main1 from "../image/main1.jpg";
import main2 from "../image/main2.jpg";
import main3 from "../image/main3.jpg";
import main4 from "../image/main4.jpg";
import main5 from "../image/main5.jpg";
import main6 from "../image/main6.JPG";
import main7 from "../image/main7.JPG";
import main8 from "../image/main8.jpg";

function Main_page() {
  const navigate = useNavigate();

  // 이미지 배열
  const images = [main1, main2, main3, main4, main5, main6, main7, main8];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 5초마다 이미지 자동 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, [images.length]);

  const menuItems = [
    {
      id: 1,
      title: "대시보드",
      description: "사업소 입출고 현황 및 통계를\n한눈에 확인할 수 있습니다.",
      path: "/dashboard",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "출고등록",
      description: "현장의 자재 출고 내역을\n손쉽게 등록하고 관리합니다.",
      path: "/Mat_output_page",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "자재수불명세서대장",
      description: "기간별 자재 입출고 및\n재고 현황을 상세히 조회합니다.",
      path: "/Statement_page",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* 대문 사진 영역 */}
      <div className="w-full h-80 md:h-[450px] lg:h-[650px] relative overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src={images[currentImageIndex]}
          alt={`메인 이미지 ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* 텍스트 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              자재 관리 시스템
            </h1>
            <p className="text-lg md:text-xl drop-shadow-md">
              효율적인 자재 관리를 위한 통합 솔루션
            </p>
          </div>
        </div>

        {/* 이미지 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                ? "w-8 bg-white"
                : "w-2 bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>

      {/* 메인 메뉴 아이콘 영역 */}
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">주요 메뉴</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-6 border border-gray-200 hover:border-blue-500 flex flex-col justify-between"
              >
                <div className="flex flex-row items-start space-x-4">
                  <div className="flex-shrink-0 text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm whitespace-pre-line group-hover:text-gray-600 transition-colors duration-300 leading-relaxed break-keep">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Main_page;
