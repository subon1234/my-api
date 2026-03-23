const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

// 📁 ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 📦 storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 📤 upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded ❌" });
  }

  res.json({
    message: "Upload successful 🚀",
    file: req.file.filename,
    url: `https://${req.headers.host}/files/${req.file.filename}`
  });
});

// 📂 static folder (streaming)
app.use("/files", express.static("uploads"));

// 🧪 test route
app.get("/", (req, res) => {
  res.send("Upload API Live 🚀");
});

app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

// 🔥 PORT FIX (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Running on port " + PORT);
});
