import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";

const UserNotes = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ totalNotes: 0, totalLikes: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = "https://dalnotes-production.up.railway.app";

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes(currentPage);
    }
  }, [currentPage, isAuthenticated]);

  const fetchNotes = async (page) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `${backendUrl}/api/my-notes?pagination[page]=${page}&pagination[pageSize]=6`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("My Notes API Response:", response.data);
      if (response.data.data) {
        setNotes(response.data.data);
        setTotalPages(response.data.meta.pagination.pageCount);
        setStats({
          totalNotes: response.data.meta.stats.totalNotes,
          totalLikes: response.data.meta.stats.totalLikes,
        });
      }
    } catch (error) {
      console.error("Error fetching user notes:", error);
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

  if (!isAuthenticated) {
    return <p className="dashboard-message">Please log in to view your dashboard.</p>;
  }

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <p>Manage your notes and track your contributions.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Notes Uploaded</h3>
          <p>{stats.totalNotes}</p>
        </div>
        <div className="stat-card">
          <h3>Total Likes Received</h3>
          <p>{stats.totalLikes}</p>
        </div>
      </div>

      <div className="dashboard-table">
        <h2>Your Notes</h2>
        {notes.length > 0 ? (
          <>
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Likes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id}>
                    <td>{note.Title}</td>
                    <td>{note.Course}</td>
                    <td>{note.Author}</td>
                    <td>{new Date(note.Date).toLocaleDateString()}</td>
                    <td>{note.LikesCount}</td>
                    <td>
                      {note.File && note.File[0]?.url ? (
                        <button
                          onClick={() => handleDownload(note.File, note.Title)}
                          className="view-btn"
                        >
                          Download
                        </button>
                      ) : (
                        <span>No file</span>
                      )}
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
          </>
        ) : (
          <p className="dashboard-message">You haven’t submitted any notes yet.</p>
        )}
      </div>
    </section>
  );
};

export default UserNotes;