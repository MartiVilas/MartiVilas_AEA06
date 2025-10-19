import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DB_PATH    = path.join(__dirname, "..", "db", "db.json");

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}
function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

/* Listado */
router.get("/", (req, res) => {
  const db = readDB();
  const q = (req.query.q || "").toLowerCase().trim();
  let animes = db.animes;
  if (q) {
    animes = animes.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      (a.studio || "").toLowerCase().includes(q) ||
      (a.status || "").toLowerCase().includes(q) ||
      (a.genres || []).join(" ").toLowerCase().includes(q)
    );
  }
  res.render("animes", { animes, q });
});

/* Form crear */
router.get("/new", (req, res) => {
  res.render("new_anime");
});

/* Crear */
router.post("/", (req, res) => {
  const db = readDB();
  const { title, studio, episodes, status, year, genres, synopsis, imageUrl } = req.body;
  const nextId = db.animes.length ? Math.max(...db.animes.map(a => Number(a.id))) + 1 : 1;
  const anime = {
    id: nextId,
    title,
    studio,
    episodes: Number(episodes) || 0,
    status,
    year: Number(year) || null,
    genres: Array.isArray(genres) ? genres : (genres ? String(genres).split(",").map(s => s.trim()) : []),
    synopsis,
    imageUrl
  };
  db.animes.push(anime);
  writeDB(db);
  res.redirect(`/animes/${anime.id}`);
});

/* Detalle */
router.get("/:id", (req, res) => {
  const db = readDB();
  const anime = db.animes.find(a => String(a.id) === req.params.id);
  if (!anime) return res.status(404).send("Anime no encontrado");
  res.render("anime", { anime });
});

/* Editar (form) */
router.get("/:id/edit", (req, res) => {
  const db = readDB();
  const anime = db.animes.find(a => String(a.id) === req.params.id);
  if (!anime) return res.status(404).send("Anime no encontrado");
  res.render("edit_anime", { anime });
});

/* Actualizar */
router.put("/:id", (req, res) => {
  const db = readDB();
  const idx = db.animes.findIndex(a => String(a.id) === req.params.id);
  if (idx === -1) return res.status(404).send("Anime no encontrado");
  const { title, studio, episodes, status, year, genres, synopsis, imageUrl } = req.body;
  db.animes[idx] = {
    ...db.animes[idx],
    title,
    studio,
    episodes: Number(episodes) || 0,
    status,
    year: Number(year) || null,
    genres: Array.isArray(genres) ? genres : (genres ? String(genres).split(",").map(s => s.trim()) : []),
    synopsis,
    imageUrl
  };
  writeDB(db);
  res.redirect(`/animes/${req.params.id}`);
});

/* Eliminar */
router.delete("/:id", (req, res) => {
  const db = readDB();
  const before = db.animes.length;
  db.animes = db.animes.filter(a => String(a.id) != req.params.id);
  if (db.animes.length === before) return res.status(404).send("Anime no encontrado");
  writeDB(db);
  res.redirect("/animes");
});

export default router;
