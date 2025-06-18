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
        filtered = filtered.filter(
          (note) =>
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

  // Update the sectionStyle object
  const sectionStyle = {
    background: "#ffffff", // Changed from gradient to white
    padding: "80px 20px",
    margin: "0",
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(45deg, rgba(255,212,0,0.05) 0%, transparent 50%, rgba(255,212,0,0.05) 100%)",
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
  };

  // You may also want to update these styles for better visibility on white background
  const headerStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333333", // Changed from white to dark color
    textAlign: "center",
    marginBottom: "15px",
    letterSpacing: "0.5px",
    position: "relative",
    display: "inline-block",
  };

  const headerUnderlineStyle = {
    content: '""',
    position: "absolute",
    width: "70px",
    height: "4px",
    backgroundColor: "rgb(255,212,0)",
    bottom: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
  };

  const subtitleStyle = {
    fontSize: "16px",
    color: "#666666", // Changed from #aaa to darker color
    textAlign: "center",
    marginBottom: "40px",
    fontWeight: "400",
  };

  const searchStyle = {
    width: "100%",
    maxWidth: "500px",
    padding: "12px 20px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fafafa",
    margin: "0 auto 40px",
    display: "block",
    outline: "none",
    transition: "all 0.3s ease",
    color: "#333",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    border: "none",
    transition: "all 0.3s ease",
    position: "relative",
    textAlign: "left",
  };

  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "12px",
    lineHeight: "1.3",
  };

  const infoStyle = {
    fontSize: "14px",
    color: "#444",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#333",
    marginRight: "8px",
    minWidth: "70px",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    alignItems: "center",
  };

  const heartButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginRight: "8px",
  };

  const downloadButtonStyle = {
    background: "#1a1a1a",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  const paginationStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "40px",
  };

  const paginationButtonStyle = {
    background: "#1a1a1a",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  const pageInfoStyle = {
    color: "#333333", // Changed from white to dark color
    fontSize: "16px",
    fontWeight: "600",
  };

  const noDataStyle = {
    textAlign: "center",
    color: "#333333", // Changed from white to dark color
    fontSize: "18px",
    padding: "60px 40px",
    background: "rgba(0,0,0,0.05)", // Lighter background
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.1)",
  };

  return (
    <section id="notes" className="notes-section" style={sectionStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h2 style={headerStyle}>
          🚀 Notes Database
          <div style={headerUnderlineStyle}></div>
        </h2>
        <p style={subtitleStyle}>Explore notes shared by fellow students</p>

        <input
          type="text"
          placeholder="🔍 Search notes by title, course, or author..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
          style={searchStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "rgb(255,212,0)";
            e.target.style.boxShadow = "0 0 5px rgba(255, 212, 0, 0.3)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
            e.target.style.boxShadow = "none";
          }}
        />

        <div className="notes-grid" style={gridStyle}>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="note-card"
                style={cardStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, cardHoverStyle);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 15px 35px rgba(0,0,0,0.1)";
                }}
              >
                <h3 style={titleStyle}>{note.Title}</h3>

                <div style={infoStyle}>
                  <span style={labelStyle}>📚 Course:</span>
                  <span>{note.Course}</span>
                </div>

                <div style={infoStyle}>
                  <span style={labelStyle}>🏷️ Category:</span>
                  <span>{note.Category}</span>
                </div>

                <div style={infoStyle}>
                  <span style={labelStyle}>👤 Author:</span>
                  <span>{note.Author}</span>
                </div>

                <div style={infoStyle}>
                  <span style={labelStyle}>📅 Date:</span>
                  <span>{new Date(note.Date).toLocaleDateString()}</span>
                </div>

                <div style={buttonContainerStyle}>
                  <button
                    onClick={() => handleLike(note.id, note.Liked)}
                    style={{
                      ...heartButtonStyle,
                      color: note.Liked ? "#e53e3e" : "#a0aec0",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = note.Liked
                        ? "rgba(229, 62, 62, 0.1)"
                        : "rgba(160, 174, 192, 0.1)";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    {note.Liked ? "❤️" : "🤍"}
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      {note.LikesCount}
                    </span>
                  </button>

                  {note.File && note.File[0]?.url ? (
                    <button
                      onClick={() => handleDownload(note.File, note.Title)}
                      style={downloadButtonStyle}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgb(255,212,0)";
                        e.target.style.color = "#1a1a1a";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#1a1a1a";
                        e.target.style.color = "white";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      <span>📥</span>
                      Download
                    </button>
                  ) : (
                    <div
                      style={{
                        color: "#a0aec0",
                        fontSize: "14px",
                        fontStyle: "italic",
                        padding: "12px 24px",
                      }}
                    >
                      📄 No file available
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={noDataStyle}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
              <p>No notes available matching your criteria</p>
              <p
                style={{ fontSize: "14px", opacity: "0.8", marginTop: "10px" }}
              >
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>

        <div className="pagination" style={paginationStyle}>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            style={{
              ...paginationButtonStyle,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.target.style.background = "rgb(255,212,0)";
                e.target.style.color = "#1a1a1a";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.target.style.background = "#1a1a1a";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            ← Previous
          </button>

          <span style={pageInfoStyle}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            style={{
              ...paginationButtonStyle,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.background = "rgb(255,212,0)";
                e.target.style.color = "#1a1a1a";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.background = "#1a1a1a";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotesDB;