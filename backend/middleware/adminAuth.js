function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "👑 Réservé à l'Admin Suprême uniquement ! Retourne dans ton trou.",
      code: "FORBIDDEN_NOT_ADMIN",
    });
  }

  next();
}

module.exports = adminMiddleware;
