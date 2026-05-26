const { getDB } = require("../database/connection");
const { ObjectId } = require("mongodb");

// GET /api/users — tous les utilisateurs
async function getAllUsers(req, res) {
  try {
    const db = getDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ reputation: -1 })
      .toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération des utilisateurs" });
  }
}

// GET /api/users/stats — stats globales
async function getStats(req, res) {
  try {
    const db = getDB();

    const totalUsers = await db.collection("users").countDocuments();
    const totalEvents = await db.collection("events").countDocuments();
    const activeEvents = await db
      .collection("events")
      .countDocuments({ date: { $gte: new Date() } });
    const bannedUsers = await db
      .collection("users")
      .countDocuments({ isBanned: true });

    // Répartition par catégorie
    const categories = await db
      .collection("users")
      .aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Répartition des types de missions
    const missionTypes = await db
      .collection("events")
      .aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Top 5 criminels (par réputation)
    const topCriminals = await db
      .collection("users")
      .find({ isBanned: false }, { projection: { password: 0 } })
      .sort({ missionsCompleted: -1, reputation: -1 })
      .limit(5)
      .toArray();

    // Missions récentes
    const recentMissions = await db
      .collection("events")
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    res.json({
      totalUsers,
      totalEvents,
      activeEvents,
      bannedUsers,
      categories,
      missionTypes,
      topCriminals,
      recentMissions,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Erreur de récupération des statistiques" });
  }
}

// GET /api/users/leaderboard
async function getLeaderboard(req, res) {
  try {
    const db = getDB();
    const leaders = await db
      .collection("users")
      .find({ isBanned: false }, { projection: { password: 0 } })
      .sort({ missionsCompleted: -1, reputation: -1 })
      .limit(10)
      .toArray();
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: "Erreur leaderboard" });
  }
}

// GET /api/users/:id
async function getUserById(req, res) {
  try {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.params.id) },
        { projection: { password: 0 } }
      );
    if (!user) {
      return res.status(404).json({ error: "🔍 Criminel introuvable dans nos fichiers !" });
    }
    // Missions créées par cet user
    const missions = await db
      .collection("events")
      .find({ creator: req.params.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ ...user, missions });
  } catch (err) {
    if (err.message.includes("24 hex")) {
      return res.status(400).json({ error: "ID invalide" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// PUT /api/users/:id
async function updateUser(req, res) {
  try {
    const db = getDB();
    const { username, category, bio } = req.body;

    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        error: "🚫 Pas touche aux profils des autres criminels !",
      });
    }

    const update = { updatedAt: new Date() };
    if (username) {
      // Vérifier unicité
      const existing = await db
        .collection("users")
        .findOne({ username, _id: { $ne: new ObjectId(req.params.id) } });
      if (existing) {
        return res.status(400).json({ error: "Ce pseudo est déjà pris !" });
      }
      update.username = username;
    }
    if (category) update.category = category;
    if (bio !== undefined) update.bio = bio;

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json({ message: "✅ Profil mis à jour avec succès !" });
  } catch (err) {
    if (err.message.includes("24 hex")) {
      return res.status(400).json({ error: "ID invalide" });
    }
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  try {
    const db = getDB();

    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé !" });
    }

    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Nettoyer les missions créées par cet user
    await db
      .collection("events")
      .deleteMany({ creator: req.params.id });

    res.json({ message: "💀 Criminel éliminé du réseau définitivement !" });
  } catch (err) {
    if (err.message.includes("24 hex")) {
      return res.status(400).json({ error: "ID invalide" });
    }
    res.status(500).json({ error: "Erreur de suppression" });
  }
}

// POST /api/users/:id/ban (admin only)
async function banUser(req, res) {
  try {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    if (user.role === "admin") {
      return res.status(400).json({ error: "Impossible de bannir l'Admin Suprême !" });
    }

    const newBanStatus = !user.isBanned;
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isBanned: newBanStatus } }
    );

    const action = newBanStatus ? "banni" : "débanni";
    res.json({
      message: `🔨 Criminel ${action} ! ${newBanStatus ? "Direction la prison fictive !" : "Libéré... Pour l'instant."}`,
      isBanned: newBanStatus,
    });
  } catch (err) {
    if (err.message.includes("24 hex")) {
      return res.status(400).json({ error: "ID invalide" });
    }
    res.status(500).json({ error: "Erreur de bannissement" });
  }
}

// POST /api/users/:id/badge (admin only)
async function setBadge(req, res) {
  try {
    const db = getDB();
    const { badge } = req.body;
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { badge } });
    res.json({ message: `🏆 Badge "${badge}" attribué !` });
  } catch (err) {
    res.status(500).json({ error: "Erreur badge" });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  getStats,
  getLeaderboard,
  setBadge,
};
