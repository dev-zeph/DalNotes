const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db"); // Import PostgreSQL connection

const app = express();
const PORT = process.env.PORT || 8080;

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

// 🚀 Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
