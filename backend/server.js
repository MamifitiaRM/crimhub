require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const { connectDB } = require("./database/connection");

const app = express();

// ─── MIDDLEWARES ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

// Increased limit for base64 images (missions can carry up to 8 × ~3MB)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── ROUTES ──────────────────────────────────────────────────
app.use("/api/auth",   require("./routes/auth"));
app.use("/api/users",  require("./routes/users"));
app.use("/api/events", require("./routes/events"));

// Root
app.get("/", (_req, res) => res.json({
  name: "CrimeHub API v2.0",
  status: "😈 Opérationnel",
  message: "Bienvenue dans le réseau des ténèbres.",
  endpoints: { auth: "/api/auth", users: "/api/users", events: "/api/events" },
}));

// 404
app.use("*", (req, res) =>
  res.status(404).json({ error: "🔍 Route introuvable.", path: req.originalUrl })
);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("💥 Erreur non gérée:", err);
  res.status(500).json({ error: "💥 Erreur serveur interne." });
});

// ─── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║    🦹  CrimeHub Server  v2.0  🦹         ║
╠══════════════════════════════════════════╣
║  🚀  Port   : ${PORT}                        ║
║  🌍  URL    : http://localhost:${PORT}       ║
║  😈  Status : Opérationnel               ║
╚══════════════════════════════════════════╝
`);
  });
}).catch(err => {
  console.error("❌ Impossible de démarrer:", err.message);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  const { closeDB } = require("./database/connection");
  await closeDB();
  process.exit(0);
});
