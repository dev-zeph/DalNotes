import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import NotesDB from "./components/NotesDB";
import Upload from "./components/Upload";
import Categories from "./components/Categories";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route
            path="/categories"
            element={
              <Categories
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
              />
            }
          />
          <Route
            path="/notes"
            element={
              <NotesDB
                selectedCategory={selectedCategory}
              />
            }
          />
          <Route path="/upload" element={<Upload />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;