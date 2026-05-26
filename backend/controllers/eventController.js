const { getDB } = require("../database/connection");
const { ObjectId } = require("mongodb");

const VALID_TYPES = [
  "Cambriolage","Arnaque","Braquage","Piratage","Sabotage",
  "Infiltration","Vol à la tire","Escroquerie","Coup de maître","Mission secrète",
];

// POST /api/events
async function createEvent(req, res) {
  try {
    const db = getDB();
    const { title, description, location, date, type, difficulty, reward, gains, equipment, images } = req.body;

    if (!title || !description || !location || !date || !type)
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis !" });
    if (title.length < 5)
      return res.status(400).json({ error: "Titre trop court ! (min 5 caractères)" });

    // Validate images array (max 8, each must be base64)
    let cleanImages = [];
    if (images && Array.isArray(images)) {
      if (images.length > 8)
        return res.status(400).json({ error: "Maximum 8 images par mission !" });
      cleanImages = images.map(img => ({
        name: img.name || "image.jpg",
        type: img.type || "autre",
        data: img.data, // base64 string
      }));
    }

    const event = {
      title,
      description,
      location,
      date: new Date(date),
      type,
      difficulty: difficulty || "Intermédiaire",
      reward: reward || "Gloire éternelle et réputation 😈",
      gains: gains || "",
      equipment: equipment || "",
      images: cleanImages,
      creator: req.user.id,
      creatorName: req.user.username,
      creatorCategory: req.user.category,
      participants: [req.user.id],
      participantNames: [req.user.username],
      status: "active",
      createdAt: new Date(),
      likes: 0,
    };

    const result = await db.collection("events").insertOne(event);

    // Boost creator reputation
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { missionsCount: 1, missionsCompleted: 1, reputation: 5 } }
    );

    res.status(201).json({
      message: "🎯 Mission créée ! Que le chaos commence !",
      event: { _id: result.insertedId, ...event },
    });
  } catch (err) {
    console.error("CreateEvent error:", err);
    res.status(500).json({ error: "Erreur lors de la création de la mission" });
  }
}

// GET /api/events
async function getAllEvents(req, res) {
  try {
    const db = getDB();
    const { type, status, search } = req.query;
    const filter = {};
    if (type)   filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location:    { $regex: search, $options: "i" } },
      ];
    }

    // Don't return full base64 images in list (performance) — just metadata
    const events = await db.collection("events")
      .find(filter, {
        projection: {
          title: 1, description: 1, location: 1, date: 1, type: 1,
          difficulty: 1, reward: 1, gains: 1, creator: 1, creatorName: 1,
          creatorCategory: 1, participants: 1, participantNames: 1,
          status: 1, createdAt: 1, likes: 1,
          // Return only first image for card cover
          "images": { $slice: 1 },
        },
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(events);
  } catch (err) {
    console.error("GetAllEvents error:", err);
    res.status(500).json({ error: "Erreur de récupération des missions" });
  }
}

// GET /api/events/:id  — full detail including all images
async function getEventById(req, res) {
  try {
    const db = getDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "🔍 Mission introuvable !" });

    // Participants data
    const ids = (event.participants || []).map(id => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean);
    const participantsData = await db.collection("users")
      .find({ _id: { $in: ids } }, { projection: { password: 0 } })
      .toArray();

    res.json({ ...event, participantsData });
  } catch (err) {
    if (err.message?.includes("24 hex")) return res.status(400).json({ error: "ID invalide" });
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// PUT /api/events/:id
async function updateEvent(req, res) {
  try {
    const db = getDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Mission introuvable" });
    if (event.creator !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Seul le créateur peut modifier cette mission !" });

    const { title, description, location, date, type, difficulty, reward, gains, equipment, status } = req.body;
    const update = { updatedAt: new Date() };
    if (title)       update.title       = title;
    if (description) update.description = description;
    if (location)    update.location    = location;
    if (date)        update.date        = new Date(date);
    if (type)        update.type        = type;
    if (difficulty)  update.difficulty  = difficulty;
    if (reward !== undefined)    update.reward    = reward;
    if (gains !== undefined)     update.gains     = gains;
    if (equipment !== undefined) update.equipment = equipment;
    if (status)      update.status      = status;

    await db.collection("events").updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ message: "✏️ Mission mise à jour ! Le plan a changé..." });
  } catch (err) {
    if (err.message?.includes("24 hex")) return res.status(400).json({ error: "ID invalide" });
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
}

// DELETE /api/events/:id
async function deleteEvent(req, res) {
  try {
    const db = getDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Mission introuvable" });
    if (event.creator !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Seul le créateur peut supprimer cette mission !" });

    await db.collection("events").deleteOne({ _id: new ObjectId(req.params.id) });
    await db.collection("users").updateOne(
      { _id: new ObjectId(event.creator) },
      { $inc: { missionsCount: -1 } }
    );
    res.json({ message: "💥 Mission annulée et détruite !" });
  } catch (err) {
    if (err.message?.includes("24 hex")) return res.status(400).json({ error: "ID invalide" });
    res.status(500).json({ error: "Erreur de suppression" });
  }
}

// POST /api/events/:id/join
async function joinEvent(req, res) {
  try {
    const db = getDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Mission introuvable" });
    if (event.status !== "active") return res.status(400).json({ error: "Cette mission n'est plus active !" });
    if (event.participants.includes(req.user.id))
      return res.status(400).json({ error: "Tu participes déjà à cette mission !" });

    await db.collection("events").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { participants: req.user.id, participantNames: req.user.username } }
    );
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { missionsCompleted: 1, reputation: 3 } }
    );
    res.json({ message: "🎯 Bienvenue dans la mission ! Tâche-toi de ne pas te faire attraper." });
  } catch (err) {
    if (err.message?.includes("24 hex")) return res.status(400).json({ error: "ID invalide" });
    res.status(500).json({ error: "Erreur lors de la participation" });
  }
}

// POST /api/events/:id/leave
async function leaveEvent(req, res) {
  try {
    const db = getDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Mission introuvable" });
    if (!event.participants.includes(req.user.id))
      return res.status(400).json({ error: "Tu ne participes pas à cette mission !" });
    if (event.creator === req.user.id)
      return res.status(400).json({ error: "Le cerveau de l'opération ne peut pas abandonner ! Supprime-la plutôt." });

    await db.collection("events").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $pull: { participants: req.user.id, participantNames: req.user.username } }
    );
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { missionsCompleted: -1, reputation: -1 } }
    );
    res.json({ message: "🏃 Tu as quitté la mission. Lâcheur !" });
  } catch (err) {
    if (err.message?.includes("24 hex")) return res.status(400).json({ error: "ID invalide" });
    res.status(500).json({ error: "Erreur lors de la désinscription" });
  }
}

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, joinEvent, leaveEvent };
