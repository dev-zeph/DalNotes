import React from 'react';
import "../App.css";

const Homepage = () => {
  return (
    <section id="home" className="homepage">
      <div className="home-content">
        <div className="header-text">
          <h1>By Dalhousie Students - For  Dalhousie Students</h1>
          <p>Welcome to Dalhousie Students Note Repository.</p>
        </div>
        <img className="home-image" src="ourlogo.jpeg" alt="Writing Notebook" />
      </div>
    </section>
  );
};

export default Homepage;
