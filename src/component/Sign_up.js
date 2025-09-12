import React, { useState } from "react";

function Sign_up({ isOpen, toggleModal, onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    position: "사원",
    email: "",
    business_location: "GK사업소",
    department: "ITS",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      if (!/^\d{0,7}$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username.length !== 7) {
      alert("아이디는 7자리 숫자로 입력해야 합니다.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // alert 제거하고 onSuccess 호출
        onSuccess();
      } else if (response.status === 409) {
        alert(`회원가입 실패: ${data.message}`);
      } else if (response.status === 400) {
        alert(`회원가입 실패: ${data.message}`);
      } else {
        alert(`회원가입 실패: ${data.message || "알 수 없는 오류가 발생했습니다."}`);
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("서버 오류! 다시 시도해주세요.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <button
          onClick={toggleModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">회원가입</h2>

        <form onSubmit={handleSubmit}>
          <InputField
            label="아이디 (7자리 숫자) 예시: 2230202"
            name="username"
            value={formData.username}
            onChange={handleChange}
            maxLength={7}
          />
          <InputField
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <InputField label="이름" name="full_name" value={formData.full_name} onChange={handleChange} />
          <SelectField
            label="직급"
            name="position"
            value={formData.position}
            onChange={handleChange}
            options={["사원", "대리", "과장", "차장", "부장"]}
          />
          <InputField
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <SelectField
            label="사업소"
            name="business_location"
            value={formData.business_location}
            onChange={handleChange}
            options={["GK사업소", "천마사업소", "을숙도사업소"]}
          />
          <SelectField
            label="부서"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={["ITS", "기전", "시설", "장비"]}
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, maxLength }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`${label}을(를) 입력하세요`}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Sign_up;