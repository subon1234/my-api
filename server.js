const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = "subon123";

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// static
app.use("/uploads", express.static("uploads"));

// auth
function checkAuth(req, res, next) {
  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized ❌" });
  }
  next();
}

// upload
app.post("/upload", checkAuth, upload.single("video"), (req, res) => {
  res.json({
    message: "Uploaded successfully",
    title: req.body.title,
    video: `/uploads/${req.file.filename}`
  });
});

// test
app.get("/", (req, res) => {
  res.send("My API Live 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));
