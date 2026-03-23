const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 storage setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 🎬 upload route (anime + title)
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const title = req.body.title;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      message: "Anime uploaded 🚀",
      title: title,
      file: req.file.filename,
      url: `https://${req.headers.host}/files/${req.file.filename}`
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📂 static file access (streaming)
app.use("/files", express.static("uploads"));

// 🏠 home
app.get("/", (req, res) => {
  res.send("Anime Upload API Live 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
