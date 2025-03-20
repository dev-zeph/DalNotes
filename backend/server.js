const express = require("express");
const cors = require("cors");
const pool = require("./config/db"); // Import PostgreSQL connection
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 6000;
app.use(cors());
app.use(express.json());

// 📝 Test API
app.get("/", (req, res) => {
  res.send("Welcome to DalNotes Backend API 🚀");
});

// ✅ Get All Notes
app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notes ORDER BY created_at DESC;");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve notes" });
  }
});

// ✅ Add a Note
app.post("/notes", async (req, res) => {
  const { title, course, author, file_url } = req.body;
  if (!title || !course || !author || !file_url) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO notes (title, course, author, file_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, course, author, file_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to add note" });
  }
});

// ✅ Get a Single Note by ID
app.get("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve note" });
  }
});

// ✅ Delete a Note
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ✅ Download File (Assuming file URLs are stored)
app.get("/notes/download/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT file_url FROM notes WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }
    res.redirect(result.rows[0].file_url);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch file URL" });
  }
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
