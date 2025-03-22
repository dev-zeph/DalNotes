import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import Homepage from "./pages/homepage";
import Categories from "./pages/categories";
import NotesDB from "./pages/notesdb";
import Upload from "./pages/upload";
import Header from "./pages/navbar";
import Footer from "./pages/footer";
import Callback from "./pages/callback"; 
import UserNotes from "./pages/usernotes"; // Import UserNotes for user-specific notes

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN" // e.g., dev-abc123.us.auth0.com
      clientId="YOUR_CLIENT_ID" // e.g., xyz789
      redirectUri={window.location.origin + "/callback"}
      audience="https://dalnotes-api"
      scope="read:current_user"
    >
      <Router>
        <Header setSelectedCategory={setSelectedCategory} />
        <Routes>
          <Route
            path="/"
            element={
              <>
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
                </div>
              </>
            }
          />
          <Route path="/callback" element={<Callback />} />
          <Route path="/my-notes" element={<UserNotes />} />
        </Routes>
        <Footer />
      </Router>
    </Auth0Provider>
  );
}

export default App;