import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";

const Navbar = ({ setSelectedCategory }) => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: document.getElementById("notes").offsetTop, behavior: "smooth" });
  };

  return (
    <header>
      <nav>
        <Link to="/" className="logo">
          DalNotes
        </Link>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <a href="#categories" onClick={() => handleCategoryClick("")}>Categories</a>
          </li>
          <li>
            <a href="#notes" onClick={() => handleCategoryClick("")}>Notes</a>
          </li>
          <li>
            <a href="#upload" onClick={() => handleCategoryClick("")}>Upload</a>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/my-notes">My Notes</Link>
            </li>
          )}
          {isAuthenticated ? (
            <>
              <li className="user-welcome">
                <span>Welcome, {user.name}</span>
              </li>
              <li>
                <button
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="nav-btn logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button onClick={() => loginWithRedirect()} className="nav-btn login-btn">
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;