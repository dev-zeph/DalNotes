import React from "react";
import "../App.css";

const Header = () => {
  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header>
      <nav>
        <div className="logo">Dal Notes</div>
        <ul>
          <li><a href="#home" onClick={(e) => handleScroll(e, "home")}>Home</a></li>
          <li><a href="#categories" onClick={(e) => handleScroll(e, "categories")}>Categories</a></li>
          <li><a href="#notes" onClick={(e) => handleScroll(e, "notes")}>Notes</a></li>
          <li><a href="#upload" onClick={(e) => handleScroll(e, "upload")}>Upload</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
