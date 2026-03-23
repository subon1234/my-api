const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req,res)=>{
  res.send("My API Live 🚀");
});

app.get("/test", (req,res)=>{
  res.json({message:"API working"});
});

app.listen(3000, ()=>{
  console.log("Running on port 3000");
});
