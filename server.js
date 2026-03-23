const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ADMIN_PASS = "subon123";

// 📁 ensure uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 📂 DB FILE
const DB_FILE = "db.json";

// load DB safely
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch {
    return []; // corrupt file fix
  }
}

// save DB
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 📦 multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 🔐 auth
function checkAuth(req, res, next) {
  const pass = req.headers["x-admin-password"];
  if (pass !== ADMIN_PASS) {
    return res.status(403).json({ error: "Unauthorized ❌" });
  }
  next();
}

// 🎬 upload route
app.post("/upload", checkAuth, upload.fields([
  { name: "file", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), (req, res) => {

  try {
    let title = req.body.title?.trim();
    let episode = req.body.episode;

    const video = req.files?.file?.[0];
    const banner = req.files?.banner?.[0];

    if (!title || !episode || !video) {
      return res.status(400).json({ error: "Missing fields ❌" });
    }

    let db = loadDB();

    let anime = db.find(a => a.title === title);

    // new anime
    if (!anime) {
      anime = {
        title,
        banner: banner ? banner.filename : "",
        episodes: []
      };
      db.push(anime);
    }

    // update banner
    if (banner) {
      anime.banner = banner.filename;
    }

    // add episode
    anime.episodes.push({
      episode,
      video: video.filename,
      url: `https://${req.get("host")}/files/${video.filename}`
    });

    saveDB(db);

    res.json({
      success: true,
      message: "Uploaded ✅"
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 📂 get anime
app.get("/anime", (req, res) => {
  res.json(loadDB());
});

// 📂 serve files
app.use("/files", express.static("uploads"));

// 🏠 test
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
