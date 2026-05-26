const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../database/connection");
const { ObjectId } = require("mongodb");

const JWT_SECRET = process.env.JWT_SECRET || "crimehub_secret_key_666";

const VALID_CATEGORIES = [
  "Cambrioleur 🏠",
  "Pickpocket 🧤",
  "Arnaqueur 💻",
  "Hacker 💻",
  "Escroc 🪙",
  "Pirate 🏴‍☠️",
  "Bandit masqué 🎭",
  "Génie du mal 🧠",
  "Maître du chaos 🔥",
  "Voleur de bonbons 🍬",
];

const CRIMINAL_TITLES = [
  "Le Redoutable",
  "L'Insaisissable",
  "Le Mystérieux",
  "L'Implacable",
  "Le Fantôme",
  "L'Impitoyable",
  "Le Légendaire",
  "L'Ombre",
];

async function register(req, res) {
  try {
    const { username, password, category, bio } = req.body;
    const db = getDB();

    // Validation
    if (!username || !password || !category) {
      return res.status(400).json({
        error: "Tous les champs sont requis pour rejoindre le réseau ! 📋",
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        error: "Le pseudo doit faire entre 3 et 20 caractères.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Mot de passe trop faible pour un criminel ! Minimum 6 caractères. 💪",
      });
    }

    if (!VALID_CATEGORIES.some((c) => c === category)) {
      return res.status(400).json({
        error: "Catégorie de criminel invalide ! Choisis parmi les options disponibles.",
      });
    }

    // Vérifier si username existe déjà
    const existing = await db.collection("users").findOne({ username });
    if (existing) {
      return res.status(400).json({
        error: "Ce pseudo est déjà pris par un autre criminel ! 😈 Sois plus original.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const title = CRIMINAL_TITLES[Math.floor(Math.random() * CRIMINAL_TITLES.length)];

    const user = {
      username,
      password: hashedPassword,
      category,
      title,
      bio: bio || `Je suis ${title}, un(e) ${category} redoutable que personne ne peut arrêter !`,
      role: "user",
      reputation: Math.floor(Math.random() * 50) + 10,
      missionsCount: 0,
      missionsCompleted: 0,
      isBanned: false,
      badge: null,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      joinedAt: new Date(),
      lastSeen: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    const token = jwt.sign(
      {
        id: result.insertedId.toString(),
        username,
        role: "user",
        category,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "🎉 Bienvenue dans le réseau des ténèbres !",
      token,
      user: {
        id: result.insertedId,
        username,
        category,
        role: "user",
        title,
        reputation: user.reputation,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username déjà pris !" });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const db = getDB();

    if (!username || !password) {
      return res.status(400).json({ error: "Username et mot de passe requis !" });
    }

    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: "🔍 Criminel inconnu au bataillon ! Inscris-toi d'abord.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: "🚫 Compte banni ! L'Admin Suprême t'a mis derrière les barreaux.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        error: "🔐 Mot de passe incorrect, amateur ! Encore raté.",
      });
    }

    // Mettre à jour lastSeen
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { lastSeen: new Date() } }
    );

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        category: user.category,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: `😈 Content de te revoir, ${user.title} ${user.username} !`,
      token,
      user: {
        id: user._id,
        username: user.username,
        category: user.category,
        role: user.role,
        title: user.title,
        reputation: user.reputation,
        badge: user.badge,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
}

module.exports = { register, login };
