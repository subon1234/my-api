const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());

// 📁 storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ IMPORTANT ROUTE
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file" });
  }

  const fileUrl = req.protocol + "://" + req.get("host") + "/files/" + req.file.filename;

  res.json({
    message: "Upload success 🚀",
    url: fileUrl
  });
});

// static
app.use("/files", express.static("uploads"));

// test
app.get("/", (req, res) => {
  res.send("API LIVE 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running..."));
