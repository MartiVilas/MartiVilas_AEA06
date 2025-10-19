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
function nowISO() {
  return new Date().toISOString();
}
function toInt(n, def = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : def;
}

/* Listado (filtrable por animeId y búsqueda por título/autor) */
router.get("/", (req, res) => {
  const db = readDB();
  const q = (req.query.q || "").toLowerCase().trim();
  const animeId = req.query.animeId ? String(req.query.animeId) : null;

  let reviews = db.reviews;
  if (animeId) reviews = reviews.filter(r => String(r.animeId) === animeId);
  if (q) {
    reviews = reviews.filter(r =>
      (r.title || "").toLowerCase().includes(q) ||
      (r.author || "").toLowerCase().includes(q)
    );
  }

  // Para combos de anime en el listado
  const animes = db.animes;
  res.render("reviews", { reviews, animes, q, animeId });
});

/* Form crear */
router.get("/new", (req, res) => {
  const db = readDB();
  const animes = db.animes;
  const defaultAnimeId = req.query.animeId ? Number(req.query.animeId) : "";
  res.render("new_review", { animes, defaultAnimeId });
});

/* Crear */
router.post("/", (req, res) => {
  const db = readDB();
  const { animeId, author, rating, title, content } = req.body;

  // Validaciones básicas
  if (!animeId || !db.animes.find(a => String(a.id) === String(animeId))) {
    return res.status(400).send("Anime inválido");
  }
  if (!title || String(title).trim().length < 2) {
    return res.status(400).send("Título demasiado corto");
  }
  const r = toInt(rating, 0);
  if (r < 0 || r > 10) {
    return res.status(400).send("Rating debe estar entre 0 y 10");
  }

  const nextId = db.reviews.length ? Math.max(...db.reviews.map(x => Number(x.id))) + 1 : 1;
  const review = {
    id: nextId,
    animeId: Number(animeId),
    author: author || "Anónimo",
    rating: r,
    title: String(title).trim(),
    content: content || "",
    createdAt: nowISO(),
  };

  db.reviews.push(review);
  writeDB(db);
  res.redirect(`/reviews/${review.id}`);
});

/* Detalle */
router.get("/:id", (req, res) => {
  const db = readDB();
  const review = db.reviews.find(r => String(r.id) === req.params.id);
  if (!review) return res.status(404).send("Reseña no encontrada");
  const anime = db.animes.find(a => Number(a.id) === Number(review.animeId));
  res.render("review", { review, anime });
});

/* Editar (form) */
router.get("/:id/edit", (req, res) => {
  const db = readDB();
  const review = db.reviews.find(r => String(r.id) === req.params.id);
  if (!review) return res.status(404).send("Reseña no encontrada");
  const animes = db.animes;
  res.render("edit_review", { review, animes });
});

/* Actualizar */
router.put("/:id", (req, res) => {
  const db = readDB();
  const idx = db.reviews.findIndex(r => String(r.id) === req.params.id);
  if (idx === -1) return res.status(404).send("Reseña no encontrada");

  const { animeId, author, rating, title, content } = req.body;
  if (!animeId || !db.animes.find(a => String(a.id) === String(animeId))) {
    return res.status(400).send("Anime inválido");
  }
  const r = toInt(rating, 0);
  if (r < 0 || r > 10) {
    return res.status(400).send("Rating debe estar entre 0 y 10");
  }

  db.reviews[idx] = {
    ...db.reviews[idx],
    animeId: Number(animeId),
    author: author || "Anónimo",
    rating: r,
    title: String(title || "").trim(),
    content: content || "",
  };
  writeDB(db);
  res.redirect(`/reviews/${req.params.id}`);
});

/* Eliminar */
router.delete("/:id", (req, res) => {
  const db = readDB();
  const before = db.reviews.length;
  db.reviews = db.reviews.filter(r => String(r.id) !== req.params.id);
  if (db.reviews.length === before) return res.status(404).send("Reseña no encontrada");
  writeDB(db);
  res.redirect("/reviews");
});

export default router;
