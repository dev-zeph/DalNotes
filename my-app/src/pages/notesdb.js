import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";

const NotesDB = ({ selectedCategory }) => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(selectedCategory || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = "https://dalnotes-production.up.railway.app";

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query) {
        const results = notes.filter(
          (note) =>
            note.Title.toLowerCase().includes(query.toLowerCase()) ||
            note.Course.toLowerCase().includes(query.toLowerCase()) ||
            note.Author.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredNotes(results);
      } else {
        setFilteredNotes(notes);
      }
    },
    [notes]
  );

  useEffect(() => {
    fetchNotes(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedCategory) {
      setSearchQuery(selectedCategory);
      handleSearch(selectedCategory);
    }
  }, [selectedCategory, handleSearch]);

  const fetchNotes = async (page) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/notes?pagination[page]=${page}&pagination[pageSize]=6`
      );
      console.log("API Response:", response.data);
      if (response.data.data) {
        setNotes(response.data.data);
        setFilteredNotes(response.data.data);
        setTotalPages(response.data.meta.pagination.pageCount);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleDownload = (file, title) => {
    if (!file || !file[0]?.url) {
      console.log("No file available for this note:", file);
      return;
    }

    const fileUrl = file[0].url;
    const originalFilename = fileUrl.split("/").pop();
    console.log("Downloading from:", fileUrl);
    axios({
      url: fileUrl,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", originalFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading file:", error));
  };

  const handleLike = async (noteId, likedByUser) => {
    if (!isAuthenticated) {
      alert("Please log in to like notes.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      if (likedByUser) {
        await axios.delete(`${backendUrl}/api/notes/${noteId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${backendUrl}/api/notes/${noteId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchNotes(currentPage);
    } catch (error) {
      console.error("Error liking/unliking note:", error);
      alert("Failed to update like: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = await getAccessTokenSilently();
      await axios.delete(`${backendUrl}/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Note deleted successfully!");
      fetchNotes(currentPage);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note: " + (error.response?.data?.error || error.message));
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <section id="notes" className="notes-section">
      <h2>Notes Database</h2>
      <p>Explore notes shared by fellow students</p>

      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />

      <div className="notes-grid">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.Title}</h3>
              <p><strong>Course:</strong> {note.Course}</p>
              <p><strong>Author:</strong> {note.Author}</p>
              <p><strong>Date:</strong> {new Date(note.Date).toLocaleDateString()}</p>
              <p><strong>Likes:</strong> {note.LikesCount}</p>
              <button
                onClick={() => handleLike(note.id, note.LikedByUser)}
                className={note.LikedByUser ? "unlike-btn" : "like-btn"}
              >
                {note.LikedByUser ? "Unlike" : "Like"}
              </button>
              {note.File && note.File[0]?.url ? (
                <button
                  onClick={() => handleDownload(note.File, note.Title)}
                  className="view-btn"
                >
                  Download
                </button>
              ) : (
                <p>No file available</p>
              )}
              {isAuthenticated && note.UserId === user?.sub && (
                <button
                  onClick={() => handleDelete(note.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No notes available</p>
        )}
      </div>

      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </section>
  );
};

export default NotesDB;