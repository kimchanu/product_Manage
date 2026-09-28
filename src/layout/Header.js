import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import UserInfo from '../component/User_info';
import mainLogo from '../image/main_logo.png';
import './Header.css';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('authToken'); navigate('/Login_page'); };
  return <header className="app-header">
    <Link to="/" className="header-logo-link"><img src={mainLogo} alt="KOINFRA" className="header-logo-img" /></Link>
    <UserInfo setUser={setUser} />
    <div className="header-top-row">
      <nav className="header-nav" aria-label="주요 서비스"><div className="header-category-wrap">
        <NavLink to="/" end className="header-service">메인</NavLink>
        <NavLink to="/dashboard" className="header-service">대시보드</NavLink>
        <NavLink to="/PostList_page" className="header-service">게시판</NavLink>
        <NavLink to="/statement-approvals" className="header-service">전자결재</NavLink>
        {Number(user?.admin || 0) >= 1 && <NavLink to="/admin" className="header-service">관리자</NavLink>}
      </div></nav>
      <div className="header-user-actions">{user ? <>
        <span className="header-user-name">{user.business_location} {user.name}</span>
        <Link to="/mypage" className="header-mypage-link" title="마이페이지"><FiUser /><span>마이페이지</span></Link>
        <button onClick={logout} className="header-logout-btn" title="로그아웃"><FiLogOut /><span>로그아웃</span></button>
      </> : <Link to="/Login_page" className="header-mypage-link">로그인</Link>}</div>
    </div>
  </header>;
}
