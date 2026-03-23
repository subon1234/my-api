const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 ADMIN LOGIN
const ADMIN_USER = "admin";
const ADMIN_PASS = "subon123";

// 📁 storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 📦 simple DB (JSON)
const DB_FILE = "db.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 🔐 login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true });
  }

  res.status(401).json({ error: "Invalid login" });
});

// 🔒 auth middleware
function checkAuth(req, res, next) {
  const pass = req.headers["x-admin-password"];

  if (pass !== ADMIN_PASS) {
    return res.status(403).json({ error: "Unauthorized ❌" });
  }

  next();
}

// 🎬 upload anime + episode
app.post("/upload", checkAuth, upload.fields([
  { name: "file", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), (req, res) => {
  try {
    const { title, episode } = req.body;

    const video = req.files["file"]?.[0]?.filename;
    const banner = req.files["banner"]?.[0]?.filename;

    if (!title || !episode || !video) {
      return res.status(400).json({ error: "Missing data" });
    }

    let db = loadDB();

    // anime find
    let anime = db.find(a => a.title === title);

    if (!anime) {
      anime = {
        title,
        banner,
        episodes: []
      };
      db.push(anime);
    }

    // add episode
    anime.episodes.push({
      episode,
      video,
      url: `${req.protocol}://${req.get("host")}/files/${video}`
    });

    saveDB(db);

    res.json({
      message: "Anime uploaded 🚀",
      title,
      episode,
      videoUrl: `${req.protocol}://${req.get("host")}/files/${video}`,
      bannerUrl: banner ? `${req.protocol}://${req.get("host")}/files/${banner}` : null
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📂 get all anime
app.get("/anime", (req, res) => {
  res.json(loadDB());
});

// 📂 static files
app.use("/files", express.static("uploads"));

// 🏠 home
app.get("/", (req, res) => {
  res.send("Anime API Live 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
