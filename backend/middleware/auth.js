const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "crimehub_secret_key_666";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "🚫 Accès interdit ! Montre ton badge de criminel.",
      code: "NO_TOKEN",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "⏰ Ton badge a expiré ! Reconnecte-toi.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      error: "🔍 Badge invalide ou falsifié. Bien tenté...",
      code: "INVALID_TOKEN",
    });
  }
}

module.exports = authMiddleware;
