import React, { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./pages/homepage";
import Categories from "./pages/categories"; // ✅ Check this import
import NotesDB from "./pages/notesdb";
import Upload from "./pages/upload";
import Header from "./pages/header"; 
import Footer from "./pages/footer";


function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <Router>
      <Header /> {/* ✅ Add Header to enable navigation */}
      <div id="home">
        <Homepage />
      </div>
      <div id="categories">
        <Categories onCategoryClick={setSelectedCategory} />
      </div>
      <div id="notes">
        <NotesDB selectedCategory={selectedCategory} />
      </div>
      <div id="upload">
        <Upload />
        <Footer />
      </div>
    </Router>
  );
}

export default App;