import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const Homepage = () => {
  return (
    <section id="home" className="hero-section">
      <div className="home-content">
        <div className="header-text">
          <h1>By Dalhousie Students - For Dalhousie Students</h1>
          <p>Welcome to Dalhousie Students Note Repository.</p>
          <Link to="/notes" className="cta-btn">
            Explore Notes
          </Link>
        </div>
        <img className="home-image" src="ourlogo.jpeg" alt="DalNotes Logo" />
      </div>
    </section>
  );
};

export default Homepage;