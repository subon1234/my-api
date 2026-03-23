const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());

// storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// upload route
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "Upload successful 🚀",
    file: req.file.filename,
    url: `https://${req.headers.host}/files/${req.file.filename}`
  });
});

// static folder
app.use("/files", express.static("uploads"));

// home
app.get("/", (req, res) => {
  res.send("Upload API Live 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running...");
});
