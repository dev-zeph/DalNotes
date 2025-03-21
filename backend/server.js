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
      SELECT id, title, course, author, created_at, file_url 
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
      // Removed ACL: "public-read" - we'll use a bucket policy instead
    };
    const s3Result = await s3.upload(s3Params).promise();
    const fileUrl = s3Result.Location;
    console.log("S3 upload successful:", fileUrl);

    console.log("Saving to database...");
    const query = `
      INSERT INTO note (title, course, author, file_url, created_at)
      VALUES ($1, $2, $3, $4, NOW())
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
      },
    });
  } catch (error) {
    console.error("Error uploading note:", error.stack);
    res.status(500).json({ error: "Failed to upload note", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});