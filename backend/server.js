const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db"); // Import PostgreSQL connection

const app = express();
const PORT = process.env.PORT || 8080;

// CORS setup (we’ll lock it down with your Vercel URL later)
app.use(cors());
app.use(express.json());

// ✅ Test API Route
app.get("/", (req, res) => {
  res.send("Welcome to DalNotes Backend API 🚀");
});

// ✅ Test Database Connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW();");
    res.json({
      success: true,
      message: "Database Connected!",
      result: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error.message,
    });
  }
});

// ✅ Notes API Endpoint (mimicking Strapi structure)
app.get("/api/notes", async (req, res) => {
  const page = parseInt(req.query["pagination[page]"]) || 1;
  const pageSize = parseInt(req.query["pagination[pageSize]"]) || 6;
  const offset = (page - 1) * pageSize;

  try {
    // Fetch notes with pagination
    const notesQuery = `
      SELECT id, title, course, author, created_at, file_url 
      FROM notes 
      LIMIT $1 OFFSET $2
    `;
    const countQuery = "SELECT COUNT(*) FROM notes";
    
    const notesResult = await pool.query(notesQuery, [pageSize, offset]);
    const countResult = await pool.query(countQuery);

    const totalNotes = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalNotes / pageSize);

    // Format response to match Strapi
    const response = {
      data: notesResult.rows.map((note) => ({
        id: note.id,
        Title: note.title,      // Capitalized to match frontend
        Course: note.course,    // Capitalized to match frontend
        Author: note.author,    // Capitalized to match frontend
        Date: note.created_at,  // Using created_at as Date to match frontend
        File: note.file_url ? [{ url: note.file_url }] : [], // Matches your column
      })),
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: totalPages,
          total: totalNotes,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// 🚀 Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});