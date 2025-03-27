import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../App.css";

const NotesDB = ({ selectedCategory }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = "https://dalnotes-production.up.railway.app"; // Railway backend

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);

      let filtered = notes;

      // Filter by selectedCategory if it exists
      if (selectedCategory) {
        filtered = filtered.filter((note) =>
          note.Category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      // Further filter by search query if it exists
      if (query) {
        filtered = filtered.filter(
          (note) =>
            note.Title.toLowerCase().includes(query.toLowerCase()) ||
            note.Course.toLowerCase().includes(query.toLowerCase()) ||
            note.Author.toLowerCase().includes(query.toLowerCase())
        );
      }

      console.log("Filtered Notes:", filtered); // Log filtered notes
      setFilteredNotes(filtered);
    },
    [notes, selectedCategory]
  );

  useEffect(() => {
    fetchNotes(currentPage);
  }, [currentPage, backendUrl]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when selectedCategory changes
    handleSearch(searchQuery); // Re-filter when selectedCategory changes
  }, [selectedCategory, handleSearch]);

  const fetchNotes = (page) => {
    axios
      .get(
        `${backendUrl}/api/notes?pagination[page]=${page}&pagination[pageSize]=6` // Removed populate=File
      )
      .then((response) => {
        console.log("Fetched Notes:", response.data.data); // Log fetched notes
        if (response.data.data) {
          setNotes(response.data.data);
          setFilteredNotes(response.data.data);
          setTotalPages(response.data.meta.pagination.pageCount);
          console.log("Updated Notes State:", response.data.data); // Log updated state
        } else {
          console.error("No data found in API response", response.data);
        }
      })
      .catch((error) => console.error("Error fetching notes:", error));
  };

  const handleDownload = (file, title) => {
    if (!file || !file[0]?.url) {
      console.log("No file available for this note:", file);
      return;
    }

    const fileUrl = file[0].url;
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
        link.setAttribute("download", `${title}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading file:", error));
  };

  const handleLike = async (noteId, liked) => {
    try {
      if (liked) {
        await axios.delete(`${backendUrl}/api/notes/${noteId}/like`);
      } else {
        await axios.post(`${backendUrl}/api/notes/${noteId}/like`, {});
      }
      fetchNotes(currentPage); // Refresh notes after liking/unliking
    } catch (error) {
      console.error("Error liking/unliking note:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(
        "Failed to update like: " +
          (error.response?.data?.error || error.message)
      );
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
              <p>
                <strong>Course:</strong> {note.Course}
              </p>
              <p>
                <strong>Category:</strong> {note.Category}
              </p>
              <p>
                <strong>Author:</strong> {note.Author}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(note.Date).toLocaleDateString()}
              </p>
              <p>
                <strong>Likes:</strong> {note.LikesCount}
              </p>
              <button
                onClick={() => handleLike(note.id, note.Liked)}
                className={note.Liked ? "unlike-btn" : "like-btn"}
              >
                {note.Liked ? "Unlike" : "Like"}
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