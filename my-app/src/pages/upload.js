import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const Upload = () => {
  const [formData, setFormData] = useState({
    file: null,
    fileName: "Drag or Choose PDF",
    course: "",
    title: "",
    author: "",
  });

  const [uploading, setUploading] = useState(false);

  const backendUrl = "https://dalnotes-production.up.railway.app"; // Railway backend

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
        fileName: files[0] ? files[0].name : "Drag or Choose PDF",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert("Please select a file before uploading.");
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", formData.file);
      uploadData.append("title", formData.title);
      uploadData.append("course", formData.course);
      uploadData.append("author", formData.author);

      await axios.post(`${backendUrl}/api/notes`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("File uploaded successfully!");
      setFormData({
        file: null,
        fileName: "Drag or Choose PDF",
        course: "",
        title: "",
        author: "",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="upload" className="upload-container">
      <div className="upload-header">
        <h1>Upload Notes</h1>
        <p>Share your notes with fellow students</p>
      </div>

      <form className="upload-form" onSubmit={handleUpload}>
        {/* Two-Column Input Layout */}
        <div className="form-grid">
          <label className="file-upload">
            {formData.fileName} {/* ✅ Display selected file name */}
            <input type="file" name="file" onChange={handleChange} accept=".pdf" />
          </label>

          <div className="form-group">
            <label>Course:</label>
            <input type="text" name="course" value={formData.course} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Note Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Author Name:</label>
            <input type="text" name="author" value={formData.author} onChange={handleChange} />
          </div>
        </div>

        {/* Upload & Cancel Buttons */}
        <div className="upload-buttons">
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button type="button" className="cancel-btn">Cancel</button>
        </div>
      </form>
    </section>
  );
};

export default Upload;