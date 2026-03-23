const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// 📂 Create Uploads Folder if not exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 ADMIN CONFIG
const ADMIN_PASS = "subon123";

// 📁 MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 📦 DATABASE FUNCTIONS
const DB_FILE = "db.json";
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch (err) { return []; }
}
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- ROUTES ---

// 🏠 Status Check
app.get("/", (req, res) => {
  res.send("Anime API is Live & Ready! 🚀");
});

// 🎬 UPLOAD / ADD EPISODE (Main Logic Here)
app.post("/upload", upload.fields([
  { name: "file", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), (req, res) => {
  try {
    const { title, episode } = req.body;
    const authHeader = req.headers["x-admin-password"];

    if (authHeader !== ADMIN_PASS) {
      return res.status(403).json({ error: "Wrong Password! ❌" });
    }

    const videoFile = req.files["file"]?.[0]?.filename;
    const bannerFile = req.files["banner"]?.[0]?.filename;

    if (!title || !episode || !videoFile) {
      return res.status(400).json({ error: "Title, Episode, and Video are required!" });
    }

    let db = loadDB();
    const host = req.get("host");
    const protocol = req.protocol;
    
    const videoUrl = `${protocol}://${host}/files/${videoFile}`;
    const bannerUrl = bannerFile ? `${protocol}://${host}/files/${bannerFile}` : null;

    // 🔍 Check if Anime already exists
    let anime = db.find(a => a.title.toLowerCase() === title.toLowerCase());

    if (!anime) {
      // 🆕 Naya Anime Create Karo
      anime = {
        id: Date.now().toString(),
        title: title,
        banner: bannerUrl || "https://via.placeholder.com/400x600?text=No+Banner",
        episodes: []
      };
      db.push(anime);
    } else {
      // 🔄 Purane Anime mein Banner update karo agar naya bheja hai
      if (bannerFile) {
        anime.banner = bannerUrl;
      }
    }

    // ➕ Add New Episode to the list
    anime.episodes.push({
      episodeNumber: episode,
      videoUrl: videoUrl,
      uploadDate: new Date().toLocaleString()
    });

    saveDB(db);
    res.json({ success: true, message: `Episode ${episode} added to ${title}!` });

  } catch (err) {
    res.status(500).json({ error: "Upload failed on server!" });
  }
});

// 📂 Get All Anime
app.get("/anime", (req, res) => {
  res.json(loadDB());
});

// 📁 Serve Files
app.use("/files", express.static(uploadDir));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
