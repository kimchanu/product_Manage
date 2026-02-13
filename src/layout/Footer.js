import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer text-center py-2 fixed bottom-0 w-full">
      <p className="app-footer-text text-sm">
        Copyright 2024 Koinfra. All rights reserved. | {"\uBB38\uC758\uC0AC\uD56D \uC5F0\uB77D:"}
        {" "}
        <a href="tel:070-4050-6844" className="app-footer-link hover:underline">
          070-4050-6844 Kim Chanwoo
        </a>
      </p>
    </footer>
  );
}

export default Footer;
