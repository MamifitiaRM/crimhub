require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

const CATEGORIES = [
  "Cambrioleur 🏠", "Pickpocket 🧤", "Arnaqueur 💻", "Hacker 💻",
  "Escroc 🪙", "Pirate 🏴‍☠️", "Bandit masqué 🎭", "Génie du mal 🧠",
  "Maître du chaos 🔥", "Voleur de bonbons 🍬",
];

const MISSION_TYPES = [
  "Cambriolage", "Arnaque", "Braquage", "Piratage",
  "Sabotage", "Infiltration", "Vol à la tire", "Escroquerie",
  "Coup de maître", "Mission secrète",
];

const LOCATIONS = [
  "Quartier des Ombres", "Ruelles de Valdor", "Tour Noire",
  "Port Fantôme", "Banque Centrale Fictive", "Manoir Maudit",
  "Entrepôt Abandonné Z", "Sous-sol du Casino Royal",
  "Musée de l'Improbable", "Résidence du Maire Naïf",
];

const FAKE_MISSIONS = [
  { title: "Opération Maison Rouge", description: "Infiltrer la villa rouge du quartier des riches et s'emparer du tableau en chocolat. Attention au chien qui aboie en morse.", type: "Cambriolage", difficulty: "Intermédiaire" },
  { title: "Braquage de la Banque Fantôme", description: "La Banque Fantôme détient des trésors imaginaires d'une valeur inestimable. Mission : voler la réserve de confettis dorés.", type: "Braquage", difficulty: "Difficile" },
  { title: "Mission Vol de Cookies 🍪", description: "Grand-mère a encore fait des cookies. La mission : les subtiliser tous sans qu'elle s'en aperçoive. Danger : sa vue est meilleure qu'on ne le pense.", type: "Vol à la tire", difficulty: "Légendaire" },
  { title: "Hack du Système Municipal", description: "Pirater les serveurs de la mairie et changer toutes les amendes de stationnement en bons de réduction pour glaces.", type: "Piratage", difficulty: "Difficile" },
  { title: "Escroquerie au Prince Nigérian v2", description: "Une mise à jour classique : cette fois le prince est belge et propose des gaufres en échange d'un prêt de 10€.", type: "Escroquerie", difficulty: "Facile" },
  { title: "Sabotage du Festival des Légumes", description: "Remplacer secrètement tous les légumes du festival par des légumes en plastique. Personne ne verra la différence.", type: "Sabotage", difficulty: "Intermédiaire" },
  { title: "Infiltration du Club des Tricoteurs", description: "S'infiltrer dans le club de tricot secret qui cache, selon nos informations, une réserve de pelotes de laine en or.", type: "Infiltration", difficulty: "Facile" },
];

async function seed() {
  await client.connect();
  const db = client.db("crimehub");

  console.log("🧹 Nettoyage de la base...");
  await db.collection("users").deleteMany({});
  await db.collection("events").deleteMany({});

  // Admin
  console.log("👑 Création de l'admin...");
  const adminHash = await bcrypt.hash("admin1234", 12);
  const adminResult = await db.collection("users").insertOne({
    username: "AdminSupreme",
    password: adminHash,
    category: "Génie du mal 🧠",
    title: "Le Redoutable",
    bio: "Je suis l'Admin Suprême. Rien ne m'échappe dans ce réseau.",
    role: "admin",
    reputation: 9999,
    missionsCount: 99,
    missionsCompleted: 99,
    isBanned: false,
    badge: "Criminel du Mois 🏆",
    joinedAt: new Date(),
    lastSeen: new Date(),
  });

  // Fake users
  console.log("👥 Création de 8 utilisateurs fictifs...");
  const userIds = [];
  const fakeUsers = [
    { username: "ShadowFox", category: "Bandit masqué 🎭", title: "L'Insaisissable", reputation: 320, missions: 12 },
    { username: "CryptoKing", category: "Hacker 💻", title: "L'Ombre", reputation: 280, missions: 9 },
    { username: "MarcelLeBoss", category: "Escroc 🪙", title: "Le Mystérieux", reputation: 245, missions: 8 },
    { username: "PirateDeRuelles", category: "Pickpocket 🧤", title: "Le Légendaire", reputation: 198, missions: 6 },
    { username: "CaptaineChaos", category: "Maître du chaos 🔥", title: "L'Implacable", reputation: 175, missions: 7 },
    { username: "BonbonVoleur99", category: "Voleur de bonbons 🍬", title: "Le Redoutable", reputation: 42, missions: 3 },
    { username: "GrandMaitreDuMal", category: "Génie du mal 🧠", title: "L'Impitoyable", reputation: 410, missions: 15 },
    { username: "JackLePirate", category: "Pirate 🏴‍☠️", title: "Le Fantôme", reputation: 155, missions: 5 },
  ];

  for (const u of fakeUsers) {
    const hash = await bcrypt.hash("password123", 10);
    const r = await db.collection("users").insertOne({
      username: u.username,
      password: hash,
      category: u.category,
      title: u.title,
      bio: `Je suis ${u.title}, spécialiste en ${u.category}. Ne me cherchez pas, vous ne me trouverez pas.`,
      role: "user",
      reputation: u.reputation,
      missionsCount: u.missions,
      missionsCompleted: u.missions,
      isBanned: false,
      badge: null,
      joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 3600 * 1000),
      lastSeen: new Date(),
    });
    userIds.push({ id: r.insertedId, username: u.username, category: u.category });
  }

  // Badge pour le meilleur
  await db.collection("users").updateOne(
    { username: "GrandMaitreDuMal" },
    { $set: { badge: "Criminel du Mois 🏆" } }
  );

  // Missions
  console.log("🎯 Création de missions fictives...");
  for (let i = 0; i < FAKE_MISSIONS.length; i++) {
    const m = FAKE_MISSIONS[i];
    const creator = userIds[i % userIds.length];
    const participantCount = Math.floor(Math.random() * 4) + 1;
    const participants = [creator.id.toString()];
    const participantNames = [creator.username];

    for (let j = 0; j < participantCount && j < userIds.length - 1; j++) {
      const p = userIds[(i + j + 1) % userIds.length];
      if (!participants.includes(p.id.toString())) {
        participants.push(p.id.toString());
        participantNames.push(p.username);
      }
    }

    const futureDate = new Date(Date.now() + (Math.random() * 60 - 10) * 24 * 3600 * 1000);

    await db.collection("events").insertOne({
      title: m.title,
      description: m.description,
      location: LOCATIONS[i % LOCATIONS.length],
      date: futureDate,
      type: m.type,
      difficulty: m.difficulty,
      reward: ["Gloire éternelle 😈", "1 tonne d'or imaginaire", "Réputation maximale", "Badge exclusif fictif", "Le respect de tous"][i % 5],
      creator: creator.id.toString(),
      creatorName: creator.username,
      creatorCategory: creator.category,
      participants,
      participantNames,
      status: "active",
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 3600 * 1000),
      likes: Math.floor(Math.random() * 30),
    });
  }

  // Index
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("events").createIndex({ createdAt: -1 });

  console.log("\n✅ Seed terminé !");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👑 Admin : AdminSupreme / admin1234");
  console.log("👤 User  : ShadowFox / password123");
  console.log("👤 User  : GrandMaitreDuMal / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await client.close();
}

seed().catch(err => {
  console.error("❌ Erreur seed:", err);
  process.exit(1);
});
