import React from "react";
import "../App.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
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
            <li><a href="#home">Home</a></li>
            <li><a href="#categories">Categories</a></li>
            <li><a href="#notes">Notes</a></li>
            <li><a href="#upload">Upload</a></li>
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