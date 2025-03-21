import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../App.css";

const NotesDB = ({ selectedCategory }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(selectedCategory || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = "https://dalnotes-production.up.railway.app"; // Railway backend

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);

      if (query) {
        axios
          .get(`${backendUrl}/api/notes?populate=File`)
          .then((response) => {
            console.log("Search API Response:", response.data);
            if (response.data.data) {
              const results = response.data.data.filter(
                (note) =>
                  note.Title.toLowerCase().includes(query.toLowerCase()) ||
                  note.Course.toLowerCase().includes(query.toLowerCase()) ||
                  note.Author.toLowerCase().includes(query.toLowerCase())
              );
              setFilteredNotes(results);
            }
          })
          .catch((error) =>
            console.error("Error fetching search results:", error)
          );
      } else {
        setFilteredNotes(notes);
      }
    },
    [notes, backendUrl]
  );

  useEffect(() => {
    fetchNotes(currentPage);
  }, [currentPage, backendUrl]);

  useEffect(() => {
    if (selectedCategory) {
      setSearchQuery(selectedCategory);
      handleSearch(selectedCategory);
    }
  }, [selectedCategory, handleSearch]);

  const fetchNotes = (page) => {
    axios
      .get(
        `${backendUrl}/api/notes?pagination[page]=${page}&pagination[pageSize]=6&populate=File`
      )
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data.data) {
          setNotes(response.data.data);
          setFilteredNotes(response.data.data);
          setTotalPages(response.data.meta.pagination.pageCount);
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

    const fileUrl = file[0].url; // Use the full URL from file_url
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