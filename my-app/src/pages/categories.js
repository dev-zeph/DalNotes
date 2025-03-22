import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Categories = ({ onCategoryClick, selectedCategory }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    onCategoryClick(category);
    navigate("/notes"); // Navigate to notes page to show filtered results
  };

  const handleClearSelection = () => {
    onCategoryClick(""); // Clear the selected category
    navigate("/notes"); // Navigate to notes page to show all notes
  };

  const categories = [
    "Math",
    "Science",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Business",
    "Health",
    "Politics",
    "Other",
  ];

  return (
    <section id="categories" className="categories-section">
      <h2>Categories</h2>
      <div className="categories-grid">
        <button
          className={`category-button ${selectedCategory === "" ? "selected" : ""}`}
          onClick={handleClearSelection}
          style={{ "--index": 0 }}
        >
          All Categories
        </button>
        {categories.map((category, index) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? "selected" : ""}`}
            onClick={() => handleCategoryClick(category)}
            style={{ "--index": index + 1 }}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Categories;