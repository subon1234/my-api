const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// 📁 storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 📦 simple DB (json file)
const DB_FILE = "db.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 🎬 upload anime / episode
app.post("/upload", upload.fields([
  { name: "file", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), (req, res) => {
  try {
    const { title, episode } = req.body;

    const video = req.files["file"]?.[0]?.filename;
    const banner = req.files["banner"]?.[0]?.filename;

    if (!title || !episode || !video) {
      return res.status(400).json({ error: "title, episode, file required" });
    }

    let db = loadDB();

    // 🔍 anime search
    let anime = db.find(a => a.title === title);

    if (!anime) {
      anime = {
        title,
        banner,
        episodes: []
      };
      db.push(anime);
    }

    // 🎞️ add episode
    anime.episodes.push({
      episode,
      video,
      url: `https://${req.headers.host}/files/${video}`
    });

    saveDB(db);

    res.json({
      message: "Episode added 🚀",
      title,
      episode,
      url: `https://${req.headers.host}/files/${video}`
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📂 get all anime
app.get("/anime", (req, res) => {
  res.json(loadDB());
});

// 📂 streaming
app.use("/files", express.static("uploads"));

// 🏠 home
app.get("/", (req, res) => {
  res.send("Anime API Live 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
