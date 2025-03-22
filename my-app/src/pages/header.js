import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const Header = () => {
  const location = useLocation(); // Get current route

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">Dal Notes</Link>
        </div>
        <ul className="navbar-links">
          <li>
            <Link
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/categories"
              className={location.pathname === "/categories" ? "active" : ""}
            >
              Categories
            </Link>
          </li>
          <li>
            <Link
              to="/notes"
              className={location.pathname === "/notes" ? "active" : ""}
            >
              Notes
            </Link>
          </li>
          <li>
            <Link
              to="/upload"
              className={location.pathname === "/upload" ? "active" : ""}
            >
              Upload
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;