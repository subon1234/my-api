const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// 📂 Ensure uploads directory exists (Varna error aayega)
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 ADMIN CREDENTIALS
const ADMIN_USER = "admin";
const ADMIN_PASS = "subon123";

// 📁 MULTER STORAGE CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Original name clean karke timestamp ke saath save karein
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // Limit: 100MB (Render Free tier ke liye safe)
});

// 📦 DATABASE SETUP
const DB_FILE = "db.json";

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- ROUTES ---

// 🏠 HOME ROUTE (Status Check)
app.get("/", (req, res) => {
  res.json({ status: "Online", message: "Anime API is Live 🚀", endpoints: ["/anime", "/files"] });
});

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_PASS }); // Simple token for demo
  }
  res.status(401).json({ error: "Invalid login credentials" });
});

// 🎬 UPLOAD ANIME & EPISODE
app.post("/upload", upload.fields([
  { name: "file", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), (req, res) => {
  try {
    const { title, episode } = req.body;
    const authHeader = req.headers["x-admin-password"];

    if (authHeader !== ADMIN_PASS) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const videoFile = req.files["file"]?.[0]?.filename;
    const bannerFile = req.files["banner"]?.[0]?.filename;

    if (!title || !episode || !videoFile) {
      return res.status(400).json({ error: "Title, Episode, and Video are required" });
    }

    let db = loadDB();
    let anime = db.find(a => a.title.toLowerCase() === title.toLowerCase());

    const host = req.get("host");
    const protocol = req.protocol;
    const videoUrl = `${protocol}://${host}/files/${videoFile}`;
    const bannerUrl = bannerFile ? `${protocol}://${host}/files/${bannerFile}` : (anime ? anime.banner : null);

    if (!anime) {
      anime = {
        id: Date.now().toString(),
        title,
        banner: bannerUrl,
        episodes: []
      };
      db.push(anime);
    }

    // Add new episode
    anime.episodes.push({
      episodeNumber: episode,
      videoUrl: videoUrl,
      uploadDate: new Date().toISOString()
    });

    saveDB(db);
    res.json({ message: "Success! Episode added.", anime: title });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server crashed during upload" });
  }
});

// 📂 GET ALL ANIME LIST
app.get("/anime", (req, res) => {
  res.json(loadDB());
});

// 📂 GET SPECIFIC ANIME
app.get("/anime/:id", (req, res) => {
    const db = loadDB();
    const anime = db.find(a => a.id === req.params.id);
    if (!anime) return res.status(404).json({ error: "Anime not found" });
    res.json(anime);
});

// 📁 SERVE STATIC FILES (Videos/Images)
app.use("/files", express.static(uploadDir));

const PORT = process.env.PORT || 10000; // Render usually uses 10000
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
