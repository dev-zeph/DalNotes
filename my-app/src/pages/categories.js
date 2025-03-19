import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Categories = ({ onCategoryClick, selectedCategory }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    onCategoryClick(category);
    navigate("/categories");
  };

  const categories = [
    "Math", "Science", "English", "History", "Geography",
    "Computer Science", "Business", "Health", "Politics", "Other"
  ];

  return (
    <section id="categories" className="categories-section">
      <h2>Categories</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Categories;