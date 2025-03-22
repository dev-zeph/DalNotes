import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";

const Upload = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [formData, setFormData] = useState({
    file: null,
    fileName: "Drag or Choose PDF",
    course: "",
    title: "",
    author: "",
  });

  const [uploading, setUploading] = useState(false);

  const backendUrl = "https://dalnotes-production.up.railway.app";

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

    if (!isAuthenticated) {
      alert("Please log in to upload notes.");
      return;
    }

    if (!formData.file || !formData.title || !formData.course || !formData.author) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    setUploading(true);

    try {
      const token = await getAccessTokenSilently();
      const uploadData = new FormData();
      uploadData.append("file", formData.file);
      uploadData.append("title", formData.title);
      uploadData.append("course", formData.course);
      uploadData.append("author", formData.author);

      await axios.post(`${backendUrl}/api/notes`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      alert("Error uploading file: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      file: null,
      fileName: "Drag or Choose PDF",
      course: "",
      title: "",
      author: "",
    });
  };

  return (
    <section id="upload" className="upload-container">
      <div className="upload-header">
        <h1>Upload Notes</h1>
        <p>Share your notes with fellow students</p>
      </div>

      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-grid">
          <label className="file-upload">
            {formData.fileName}
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