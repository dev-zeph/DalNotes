import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./pages/header";
import Homepage from "./pages/homepage";
import NotesDB from "./pages/notesdb";
import Upload from "./pages/upload";
import Categories from "./pages/categories";
import Footer from "./pages/footer";
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