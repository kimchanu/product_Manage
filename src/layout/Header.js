import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import User_info from "../component/User_info";
import mainLogo from "../image/main_logo.png";
import "./Header.css";

function Nav({ user }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  let timer;

  const baseCategories = [
    { name: "\uC790\uC7AC\uAD00\uB9AC", subCategories: [] },
    { name: "Null", subCategories: [] },
    { name: "Null", subCategories: [] },
  ];

  const adminCategory = {
    name: "\uAD00\uB9AC\uC790",
    subCategories: ["\uC608\uC0B0", "\uC218\uB3D9 \uC785\uB825", "\uCD9C\uACE0 \uC2B9\uC778"],
  };

  const categories =
    user && Number(user.admin) >= 1
      ? [...baseCategories, adminCategory]
      : baseCategories;

  const subCategoryRouteMap = {
    "\uC785\uACE0 \uB4F1\uB85D": "/upload",
    "\uC218\uB3D9 \uC785\uB825": "/Input_manual_page",
    "\uC785\uACE0 \uD604\uD669": "/input_mod",
    "\uC785\uACE0 \uD1B5\uACC4": "/input_statistics",
    "\uCD9C\uACE0 \uB4F1\uB85D": "/Mat_output_page",
    "\uCD9C\uACE0 \uD604\uD669": "/Output_Mod",
    "\uC608\uC0B0": "/Budget",
    "\uCD9C\uACE0 \uD1B5\uACC4": "/Output_Statistics_page",
    "\uCD9C\uACE0 \uC2B9\uC778": "/Output_Approve_page",
  };

  return (
    <nav className="header-nav">
      <div className="header-nav-inner">
        <div className="header-category-wrap">
          {categories.map((category, idx) => (
            <div
              key={idx}
              className="header-category-item"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => {
                timer = setTimeout(() => setHoveredCategory(null), 1000);
                return () => clearTimeout(timer);
              }}
              onClick={() =>
                setClickedCategory(clickedCategory === category.name ? null : category.name)
              }
            >
              {idx === 0 ? (
                <Link to="/" className="font-bold">
                  {category.name}
                </Link>
              ) : category.name === "Null" ? (
                <Link to="#" className="font-bold">
                  {category.name}
                </Link>
              ) : (
                <span className="font-bold">{category.name}</span>
              )}

              {(hoveredCategory === category.name || clickedCategory === category.name) &&
                category.subCategories.length > 0 && (
                  <div
                    className="header-submenu"
                    onMouseEnter={() => clearTimeout(timer)}
                    onMouseLeave={() => {
                      timer = setTimeout(() => setHoveredCategory(null), 1000);
                      return () => clearTimeout(timer);
                    }}
                  >
                    {category.subCategories.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        to={subCategoryRouteMap[sub] || "#"}
                        className="header-submenu-link"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login_page");
  };

  return (
    <header className="app-header">
      <Link to="/" className="header-logo-link">
        <img
          src={mainLogo}
          alt="Main Logo"
          className="header-logo-img"
        />
      </Link>
      <User_info setUser={setUser} />
      <div className="header-top-row">
        <div className="header-user-actions">
          {user ? (
            <>
              <span className="header-user-name">
                {user.business_location} {user.name}
              </span>
              <button onClick={handleLogout} className="header-logout-btn">
                {"\uB85C\uADF8\uC544\uC6C3"}
              </button>
              <Link to="/mypage" className="header-mypage-link">
                {"\uB9C8\uC774\uD398\uC774\uC9C0"}
              </Link>
            </>
          ) : (
            <Link to="/Login_page" className="header-mypage-link">
              {"\uB85C\uADF8\uC778"}
            </Link>
          )}
        </div>
      </div>
      <Nav user={user} />
    </header>
  );
}

export default Header;
