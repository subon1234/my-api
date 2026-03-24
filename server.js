const express = require("express"); const cors = require("cors"); const multer = require("multer"); const { CloudinaryStorage } = require("multer-storage-cloudinary"); const cloudinary = require("cloudinary").v2; const fs = require("fs");

const app = express(); app.use(cors()); app.use(express.json());

const ADMIN_PASS = "subon123";

cloudinary.config({ cloud_name: "ds3xbfpln", api_key: "942641863214535", api_secret: "TqnGG20lakSF3xUYc1YICE0CGnY" });

const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "anime", resource_type: "auto" } });

const upload = multer({ storage });

const DB_FILE = "db.json";

function loadDB(){ if(!fs.existsSync(DB_FILE)) return []; return JSON.parse(fs.readFileSync(DB_FILE)); }

function saveDB(data){ fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

function checkAuth(req,res,next){ if(req.headers["x-admin-password"] !== ADMIN_PASS){ return res.status(403).json({error:"Unauthorized"}); } next(); }

app.post("/upload", checkAuth, upload.fields([ { name:"file", maxCount:1 }, { name:"banner", maxCount:1 } ]), (req,res)=>{ try{ let title = req.body.title.trim(); let episode = req.body.episode;

const video = req.files.file?.[0]; const banner = req.files.banner?.[0];

if(!title || !episode || !video){ return res.status(400).json({error:"Missing data"}); }

let db = loadDB(); let anime = db.find(a=>a.title===title);

if(!anime){ anime = { title, banner: banner ? banner.path : "", episodes:[] }; db.push(anime); }

if(banner){ anime.banner = banner.path; }

anime.episodes.push({ episode, url: video.path });

saveDB(db);

res.json({ success:true });

}catch(err){ console.log(err); res.status(500).json({error:"Server error"}); } });

app.get("/anime",(req,res)=>{ res.json(loadDB()); });

app.get("/",(req,res)=>{ res.send("API Running 🚀"); });

app.listen(3000,()=>{ console.log("Server running on port 3000"); });
