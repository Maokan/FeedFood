import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config();

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));
app.use(express.static(path.join(__dirname, "..", "public")));

// Les réponses de l'API dépendent de l'utilisateur connecté (isLiked…) :
// interdiction de les mettre en cache, sinon le navigateur renvoie un 304
// et ressert une ancienne réponse, ou celle d'un autre utilisateur.
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
