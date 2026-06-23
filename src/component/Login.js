import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUp from "../component/Sign_up";
import safetyMark from "../assets/login/irasutoya-safety-mark.png";
import workerImage from "../assets/login/irasutoya-worker.png";

function LoginMascot() {
  return (
    <div className="relative mx-auto flex w-full max-w-[520px] items-end justify-center px-2 pt-8">
      <div className="absolute left-0 top-[178px] z-20">
        <div className="relative rounded-[26px] bg-white px-5 py-3 text-sm font-semibold leading-6 text-[#2d5a4c] shadow-lg shadow-black/10">
          오늘도 무사고로
          <br />
          출발
          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
        </div>
      </div>

      <div className="absolute right-0 top-[120px] z-20">
        <div className="relative rounded-[26px] bg-[#fff4d8] px-5 py-3 text-sm font-medium leading-6 text-[#7a5d22] shadow-lg shadow-black/10">
          작업 전 점검,
          <br />
          안전이 먼저예요
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-[#fff4d8]" />
        </div>
      </div>

      <div className="absolute -left-4 bottom-10 h-24 w-24 rounded-full bg-white/12 blur-2xl" />
      <div className="absolute -right-2 bottom-16 h-28 w-28 rounded-full bg-[#ffd59d]/35 blur-2xl" />

      <div className="relative mt-10 flex w-full max-w-[350px] items-end justify-center rounded-[36px] bg-white/10 px-6 pb-6 pt-20 backdrop-blur">
        <div className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl bg-[#173129]/70 px-3 py-2 backdrop-blur">
          <img
            src={safetyMark}
            alt="안전제일 마크"
            className="h-12 w-12 rounded-xl bg-white object-contain p-1.5"
          />
          <div className="text-sm leading-5 text-white/88">
            <p className="font-semibold">Safety First</p>
            <p className="text-white/68">작업 전 보호구 확인</p>
          </div>
        </div>

        <img
          src={workerImage}
          alt="헬멧을 쓴 작업자 일러스트"
          className="relative z-10 h-[300px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.24)]"
        />
      </div>
    </div>
  );
}

function Login() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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

    if (name === "email" && value.length > 7) {
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
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      }

      localStorage.setItem("authToken", data.authToken);
      setSuccessMessage("로그인 완료. 메인 화면으로 이동하고 있어요.");

      window.setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSuccess = () => {
    setSuccessMessage("회원가입이 완료되었습니다. 이제 바로 로그인해보세요.");
    setIsSignUpOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff7ef] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-6%] h-72 w-72 rounded-full bg-[#ffd7df] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-6%] h-80 w-80 rounded-full bg-[#ffe5a8] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(88,58,34,0.12)] backdrop-blur xl:grid-cols-[1.08fr_0.92fr]">
          <section className="relative overflow-hidden bg-[#22443a] px-6 py-8 text-white sm:px-10 sm:py-10 xl:min-h-[720px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.1),_transparent_28%)]" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="mx-auto w-full max-w-lg">
                <LoginMascot />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/14 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/65">안전 수칙 1</p>
                  <p className="mt-3 text-xl font-semibold leading-8">
                    보호구 착용 상태부터
                    <br />
                    작업 전에 먼저 확인해요.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/14 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/65">안전 수칙 2</p>
                  <p className="mt-3 text-sm leading-7 text-white/78">
                    이상한 소리, 냄새, 흔들림이 느껴지면 바로 멈추고 공유하는 게
                    가장 빠른 예방입니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#8d7765]">
                    Welcome Back
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1f2937]">
                    로그인
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                    사번과 비밀번호를 입력하면 바로 업무 화면으로 연결됩니다.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22443a] text-white shadow-lg shadow-[#22443a]/20">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V7.75a4.75 4.75 0 10-9.5 0v2.75m-1.5 0h12a1 1 0 011 1v7a1 1 0 01-1 1h-12a1 1 0 01-1-1v-7a1 1 0 011-1zm6 3.25v2.5"
                    />
                  </svg>
                </div>
              </div>

              {errorMessage ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#374151]">
                    사번
                  </span>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#f0dccc] bg-white px-4 py-3.5 text-base text-[#111827] shadow-sm shadow-[#b7ad9f]/10 placeholder:text-[#9ca3af] focus:border-[#ff8ea0] focus:ring-4 focus:ring-[#ffe0e6]"
                    placeholder="예: 2230202"
                    maxLength="7"
                    autoComplete="username"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#374151]">
                    비밀번호
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#f0dccc] bg-white px-4 py-3.5 text-base text-[#111827] shadow-sm shadow-[#b7ad9f]/10 placeholder:text-[#9ca3af] focus:border-[#ff8ea0] focus:ring-4 focus:ring-[#ffe0e6]"
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="current-password"
                  />
                </label>

                <div className="rounded-2xl border border-[#f5e2d6] bg-[#fff8f3] px-4 py-3 text-sm text-[#7b685c]">
                  팝업 대신 이 화면 안에서 상태를 보여주고, 로그인 성공 후 바로 메인으로
                  이동합니다.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22443a] px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#22443a]/20 hover:bg-[#19332b] disabled:cursor-not-allowed disabled:bg-[#9fb2ab]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </button>
              </form>

              <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-[#f1e2d6] bg-[#fffdfa] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#2f3b35]">
                      아직 계정이 없으신가요?
                    </p>
                    <p className="mt-1 text-sm text-[#7b7468]">
                      신규 계정을 만든 뒤 바로 로그인할 수 있어요.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSignUpOpen(true)}
                    className="shrink-0 rounded-full border border-[#d8cabd] px-4 py-2 text-sm font-semibold text-[#22443a] hover:border-[#22443a]"
                  >
                    회원가입
                  </button>
                </div>

                <div className="grid gap-3 text-sm text-[#6b7280] sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#fff5ec] px-4 py-3">
                    <p className="font-medium text-[#374151]">출근 전 체크</p>
                    <p className="mt-1">
                      로그인 전후로 오늘 필요한 장비와 작업 순서를 다시 떠올려보세요.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#fff5ec] px-4 py-3">
                    <p className="font-medium text-[#374151]">자연스러운 피드백</p>
                    <p className="mt-1">
                      실패와 성공 상태를 화면 안에서 바로 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isSignUpOpen && (
        <SignUp
          isOpen={isSignUpOpen}
          toggleModal={() => setIsSignUpOpen(false)}
          onSuccess={handleSignUpSuccess}
        />
      )}
    </div>
  );
}

export default Login;
