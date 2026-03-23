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

// 📦 storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 🚀 upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;

  res.json({
    message: "Upload successful 🚀",
    url: fileUrl
  });
});

// 📂 static files (streaming)
app.use("/files", express.static("uploads"));

// 🧪 test route
app.get("/", (req, res) => {
  res.send("Upload API Live 🚀");
});

// ⚡ PORT FIX (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
