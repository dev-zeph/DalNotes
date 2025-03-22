const express = require("express");
const cors = require("cors");
const multer = require("multer");
const AWS = require("aws-sdk");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
require("dotenv").config();
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: "https://dal-notes.vercel.app" }));
app.use(express.json());

// Auth0 JWT Middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-ty5c4ajwu51u51se.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: "https://dalnotes-api",
  issuer: `https://dev-ty5c4ajwu51u51se.us.auth0.com/`,
  algorithms: ["RS256"],
});

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
  const userId = req.user?.sub; // Optional: userId for liked_by_user check

  try {
    const notesQuery = `
      SELECT id, title, course, author, created_at, file_url, likes_count, user_id,
             EXISTS (
               SELECT 1 FROM likes WHERE note_id = note.id AND user_id = $3
             ) as liked_by_user
      FROM note 
      LIMIT $1 OFFSET $2
    `;
    const countQuery = "SELECT COUNT(*) FROM note";
    
    const notesResult = await pool.query(notesQuery, [pageSize, offset, userId || null]);
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
        LikesCount: note.likes_count,
        LikedByUser: !!note.liked_by_user,
        UserId: note.user_id,
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

app.get("/api/my-notes", checkJwt, async (req, res) => {
  const userId = req.user.sub;
  const page = parseInt(req.query["pagination[page]"]) || 1;
  const pageSize = parseInt(req.query["pagination[pageSize]"]) || 6;
  const offset = (page - 1) * pageSize;

  try {
    const notesQuery = `
      SELECT id, title, course, author, created_at, file_url, likes_count
      FROM note 
      WHERE user_id = $1
      LIMIT $2 OFFSET $3
    `;
    const countQuery = "SELECT COUNT(*) FROM note WHERE user_id = $1";
    const likesQuery = `
      SELECT SUM(likes_count) as total_likes 
      FROM note 
      WHERE user_id = $1
    `;
    
    const notesResult = await pool.query(notesQuery, [userId, pageSize, offset]);
    const countResult = await pool.query(countQuery, [userId]);
    const likesResult = await pool.query(likesQuery, [userId]);

    const totalNotes = parseInt(countResult.rows[0].count);
    const totalLikes = parseInt(likesResult.rows[0].total_likes || 0);
    const totalPages = Math.ceil(totalNotes / pageSize);

    const response = {
      data: notesResult.rows.map((note) => ({
        id: note.id,
        Title: note.title,
        Course: note.course,
        Author: note.author,
        Date: note.created_at,
        File: note.file_url ? [{ url: note.file_url }] : [],
        LikesCount: note.likes_count,
      })),
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: totalPages,
          total: totalNotes,
        },
        stats: {
          totalNotes,
          totalLikes,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ error: "Failed to fetch user notes", details: error.message });
  }
});

app.post("/api/notes", checkJwt, upload.single("file"), async (req, res) => {
  const { title, course, author } = req.body;
  const file = req.file;
  const userId = req.user.sub;

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
      INSERT INTO note (title, course, author, file_url, created_at, user_id)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING *
    `;
    const values = [title, course, author, fileUrl, userId];
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

app.post("/api/notes/:id/like", checkJwt, async (req, res) => {
  const noteId = parseInt(req.params.id);
  const userId = req.user.sub;

  try {
    // Check if the note exists
    const noteCheck = await pool.query("SELECT 1 FROM note WHERE id = $1", [noteId]);
    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if the user already liked the note
    const likeCheck = await pool.query(
      "SELECT 1 FROM likes WHERE note_id = $1 AND user_id = $2",
      [noteId, userId]
    );
    if (likeCheck.rows.length > 0) {
      return res.status(400).json({ error: "You have already liked this note" });
    }

    // Add the like
    await pool.query(
      "INSERT INTO likes (note_id, user_id) VALUES ($1, $2)",
      [noteId, userId]
    );

    // Update the likes_count in the note table
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

app.delete("/api/notes/:id/like", checkJwt, async (req, res) => {
  const noteId = parseInt(req.params.id);
  const userId = req.user.sub;

  try {
    // Check if the note exists
    const noteCheck = await pool.query("SELECT 1 FROM note WHERE id = $1", [noteId]);
    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if the user has liked the note
    const likeCheck = await pool.query(
      "SELECT 1 FROM likes WHERE note_id = $1 AND user_id = $2",
      [noteId, userId]
    );
    if (likeCheck.rows.length === 0) {
      return res.status(400).json({ error: "You have not liked this note" });
    }

    // Remove the like
    await pool.query(
      "DELETE FROM likes WHERE note_id = $1 AND user_id = $2",
      [noteId, userId]
    );

    // Update the likes_count in the note table
    await pool.query(
      "UPDATE note SET likes_count = likes_count - 1 WHERE id = $1",
      [noteId]
    );

    res.status(200).json({ message: "Note unliked successfully" });
  } catch (error) {
    console.error("Error unliking note:", error);
    res.status(500).json({ error: "Failed to unlike note", details: error.message });
  }
});

app.delete("/api/notes/:id", checkJwt, async (req, res) => {
  const noteId = parseInt(req.params.id);
  const userId = req.user.sub;

  try {
    // Check if the note exists and belongs to the user
    const noteCheck = await pool.query(
      "SELECT user_id FROM note WHERE id = $1",
      [noteId]
    );
    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    if (noteCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own notes" });
    }

    // Fetch the file URL before deletion
    const fileUrlQuery = await pool.query(
      "SELECT file_url FROM note WHERE id = $1",
      [noteId]
    );

    // Delete the note (this will cascade to likes due to ON DELETE CASCADE)
    await pool.query("DELETE FROM note WHERE id = $1", [noteId]);

    // Delete the file from S3
    if (fileUrlQuery.rows[0]?.file_url) {
      const fileKey = fileUrlQuery.rows[0].file_url.split("/").pop();
      await s3
        .deleteObject({
          Bucket: "dalnotes-buckets",
          Key: fileKey,
        })
        .promise();
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});