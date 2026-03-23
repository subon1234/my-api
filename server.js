const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// 🔥 IMPORTANT (health check route)
app.get("/", (req, res) => {
  res.send("My API Live 🚀");
});

app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

// 🔥 VERY IMPORTANT (Render fix)
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
