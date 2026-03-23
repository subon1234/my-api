const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("My API Live 🚀");
});

app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

// 🔥 IMPORTANT LINE
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
