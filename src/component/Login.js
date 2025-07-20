import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sign_up from "../component/Sign_up";

function Login() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email' && value.length > 7) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "로그인 실패! 다시 시도해주세요.");
      }

      localStorage.setItem("authToken", data.authToken);
      alert("로그인 성공!");
      navigate("/");
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrorMessage(error.message);
    }
  };

  // 회원가입 성공 시 호출되는 함수
  const handleSignUpSuccess = () => {
    alert("회원가입 성공!");
    setIsSignUpOpen(false); // 모달 닫기
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">로그인</h2>
        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="EX) 2230202"
              maxLength="7"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            로그인
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <button
              onClick={() => setIsSignUpOpen(true)}
              className="text-blue-500 hover:underline font-medium"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>

      {isSignUpOpen && (
        <Sign_up
          isOpen={isSignUpOpen}
          toggleModal={() => setIsSignUpOpen(false)}
          onSuccess={handleSignUpSuccess} // 추가
        />
      )}
    </div>
  );
}

export default Login;