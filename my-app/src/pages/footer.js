import React from "react";
import "../App.css";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation(); // Get current route
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3>Dal Notes</h3>
          <p>A platform for Dalhousie students to share and access study notes. Not affiliated with Dalhousie University.</p>
        </div>
        
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
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
            </Link></li>
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
        </div>
        
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Have questions or suggestions?</p>
          <a href="mailto:contact@dalnotes.com" className="contact-link">zephchizulu@gmail.com</a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Revive Organization. All rights reserved.</p>
        <div className="footer-policies">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;