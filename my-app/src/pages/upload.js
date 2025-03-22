import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(""); // Add category state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !course || !author || !category || !file) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("course", course);
    formData.append("author", author);
    formData.append("category", category); // Add category to form data
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await axios.post(
        "https://dalnotes-production.up.railway.app/api/notes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Note uploaded successfully!");
      setTitle("");
      setCourse("");
      setAuthor("");
      setCategory("");
      setFile(null);
    } catch (error) {
      console.error("Error uploading note:", error);
      alert("Failed to upload note: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setCourse("");
    setAuthor("");
    setCategory("");
    setFile(null);
  };

  return (
    <section id="upload" className="upload-container">
      <div className="upload-header">
        <h1>Upload a Note</h1>
        <p>Share your notes with the Dalhousie community.</p>
      </div>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Enter course name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group file-upload">
            <label htmlFor="file-upload">
              {file ? file.name : "Click to select a file"}
            </label>
            <input
              type="file"
              id="file-upload"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="upload-buttons">
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default Upload;