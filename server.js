import express from "express";
import path from "path";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import fs from "fs";

import { PORT, SECRET_JWT_KEY } from "./config.js";
import { UserRepository } from "./user-repository.js";
import animesRoutes from "./routes/animes.js";
import reviewsRoutes from "./routes/reviews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

/* ===== Configuración de vistas y estáticos ===== */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

/* ===== Middlewares ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

/* ===== Sesión JWT en cookie ===== */
app.use((req, res, next) => {
  const token = req.cookies?.access_token;
  req.session = { user: null };

  if (token) {
    try {
      const data = jwt.verify(token, SECRET_JWT_KEY);
      req.session.user = data;             // { id, username }
      res.locals.username = data.username; // disponible en las vistas EJS
    } catch {
      req.session.user = null;
    }
  }
  next();
});

/* ===== Middleware de protección ===== */
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

/* ===== Rutas de login y registro ===== */
app.get("/login", (req, res) => {
  const { user } = req.session;
  if (user) return res.redirect("/animes"); // Si ya está logado, va directo
  return res.render("login", user || {});
});

app.get("/", (_req, res) => res.redirect("/login"));

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const user = await UserRepository.login({ username, password });
    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_JWT_KEY,
      { expiresIn: "1h" }
    );
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        path: "/",
      })
      .redirect("/animes");
  } catch (err) {
    res.status(401).send(err.message ?? "Error de login");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const id = await UserRepository.create({ username, password });
    const token = jwt.sign({ id, username }, SECRET_JWT_KEY, { expiresIn: "1h" });
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60,
      path: "/",
    }).redirect("/animes");
  } catch (err) {
    res.status(400).send(err.message ?? "Error al registrar usuario");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" }).redirect("/login");
});

/* ===== Página protegida principal (muestra último anime añadido) ===== */
app.get("/protected", requireAuth, (req, res) => {
  const dbPath = path.join(__dirname, "db", "db.json");
  let lastAnime = null;

  try {
    console.log("[/protected] dbPath:", dbPath);
    const raw = fs.readFileSync(dbPath, "utf8");
    console.log("[/protected] raw length:", raw?.length);
    const db = JSON.parse(raw);
    console.log("[/protected] has animes?", Array.isArray(db?.animes), "count:", (db?.animes || []).length);

    const animes = Array.isArray(db?.animes) ? db.animes : [];
    if (animes.length) {
      lastAnime = animes.reduce((max, a) =>
        Number(a.id) > Number(max.id) ? a : max, animes[0]
      );
    }
  } catch (e) {
    console.error("[/protected] Error leyendo db.json:", e.message);
  }

  console.log("[/protected] lastAnime:", lastAnime ? lastAnime.title : "Ninguno");

  res.render("home", {
    username: req.session.user?.username || null,
    lastAnime: lastAnime || null
  });
});

/* ===== Rutas protegidas ===== */
app.use("/animes", requireAuth, animesRoutes);
app.use("/reviews", requireAuth, reviewsRoutes);

/* ===== Servidor ===== */
app.listen(PORT, () => {
  console.log(`✅ Servidor en marcha: http://localhost:${PORT}`);
});
