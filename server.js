const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 ADMIN CONFIG
const ADMIN_PASS = "subon123";
const DB_FILE = "db.json";

// 📦 DATABASE FUNCTIONS
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch (err) { return []; }
}
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 🏠 Status Check
app.get("/", (req, res) => {
  res.json({ status: "Live", message: "Anime API Ready 🚀" });
});

// 🎬 ADD EPISODE VIA DIRECT LINK (Safe for Render)
app.post("/upload-link", (req, res) => {
  try {
    const { title, episode, videoUrl, bannerUrl } = req.body;
    const authHeader = req.headers["x-admin-password"];

    if (authHeader !== ADMIN_PASS) {
      return res.status(403).json({ error: "Wrong Password! ❌" });
    }

    if (!title || !episode || !videoUrl) {
      return res.status(400).json({ error: "Title, Episode, and Link are required!" });
    }

    let db = loadDB();
    let anime = db.find(a => a.title.toLowerCase() === title.toLowerCase());

    if (!anime) {
      anime = {
        id: Date.now().toString(),
        title: title,
        banner: bannerUrl || "https://via.placeholder.com/400x600?text=No+Banner",
        episodes: []
      };
      db.push(anime);
    } else if (bannerUrl) {
      anime.banner = bannerUrl;
    }

    anime.episodes.push({
      episodeNumber: episode,
      videoUrl: videoUrl, // Streaming Link
      uploadDate: new Date().toLocaleString()
    });

    saveDB(db);
    res.json({ success: true, message: `Episode ${episode} added to ${title}!` });

  } catch (err) {
    res.status(500).json({ error: "Server Error!" });
  }
});

// 📂 Get All Anime
app.get("/anime", (req, res) => {
  res.json(loadDB());
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
