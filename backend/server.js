const express = require("express");
const cors = require("cors");
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: "https://dal-notes.vercel.app" }));
app.use(express.json());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-2",
});

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.send("Welcome to DalNotes Backend API 🚀");
});

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

app.get("/api/notes", async (req, res) => {
  const page = parseInt(req.query["pagination[page]"]) || 1;
  const pageSize = parseInt(req.query["pagination[pageSize]"]) || 6;
  const offset = (page - 1) * pageSize;

  try {
    const notesQuery = `
      SELECT id, title, course, author, created_at, file_url, user_id, likes_count
      FROM note 
      LIMIT $1 OFFSET $2
    `;
    const countQuery = "SELECT COUNT(*) FROM note";
    
    const notesResult = await pool.query(notesQuery, [pageSize, offset]);
    const countResult = await pool.query(countQuery);

    const totalNotes = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalNotes / pageSize);

    const response = {
      data: notesResult.rows.map((note) => ({
        id: note.id,
        Title: note.title,
        Course: note.course,
        Author: note.author,
        Date: note.created_at,
        File: note.file_url ? [{ url: note.file_url }] : [],
        UserId: note.user_id,
        LikesCount: note.likes_count || 0,
        Liked: false, // Default to false; frontend will manage this state
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
    res.status(500).json({ error: "Failed to fetch notes", details: error.message });
  }
});

app.post("/api/notes", upload.single("file"), async (req, res) => {
  const { title, course, author } = req.body;
  const file = req.file;

  if (!file || !title || !course || !author) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("Uploading to S3...");
    const s3Params = {
      Bucket: "dalnotes-buckets",
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `attachment; filename="${file.originalname}"`,
    };
    const s3Result = await s3.upload(s3Params).promise();
    const fileUrl = s3Result.Location;
    console.log("S3 upload successful:", fileUrl);

    console.log("Saving to database...");
    const query = `
      INSERT INTO note (title, course, author, file_url, created_at, user_id, likes_count)
      VALUES ($1, $2, $3, $4, NOW(), NULL, 0)
      RETURNING *
    `;
    const values = [title, course, author, fileUrl];
    const result = await pool.query(query, values);
    console.log("Database save successful:", result.rows[0]);

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        Title: result.rows[0].title,
        Course: result.rows[0].course,
        Author: result.rows[0].author,
        Date: result.rows[0].created_at,
        File: [{ url: fileUrl }],
        UserId: result.rows[0].user_id,
        LikesCount: result.rows[0].likes_count || 0,
        Liked: false,
      },
    });
  } catch (error) {
    console.error("Error uploading note:", error.stack);
    res.status(500).json({ error: "Failed to upload note", details: error.message });
  }
});

app.post("/api/notes/:id/like", async (req, res) => {
  const noteId = parseInt(req.params.id);

  try {
    // Check if the note exists
    const noteCheck = await pool.query("SELECT 1 FROM note WHERE id = $1", [noteId]);
    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Increment the likes_count
    await pool.query(
      "UPDATE note SET likes_count = likes_count + 1 WHERE id = $1",
      [noteId]
    );

    res.status(200).json({ message: "Note liked successfully" });
  } catch (error) {
    console.error("Error liking note:", error);
    res.status(500).json({ error: "Failed to like note", details: error.message });
  }
});

app.delete("/api/notes/:id/like", async (req, res) => {
  const noteId = parseInt(req.params.id);

  try {
    // Check if the note exists
    const noteCheck = await pool.query("SELECT 1 FROM note WHERE id = $1", [noteId]);
    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Decrement the likes_count (ensure it doesn't go below 0)
    await pool.query(
      "UPDATE note SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1",
      [noteId]
    );

    res.status(200).json({ message: "Note unliked successfully" });
  } catch (error) {
    console.error("Error unliking note:", error);
    res.status(500).json({ error: "Failed to unlike note", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});