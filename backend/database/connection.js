const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("crimehub");

    // Créer les index pour performance
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("events").createIndex({ createdAt: -1 });

    console.log("✅ Connecté à MongoDB - CrimeHub Database");
    console.log("🦹 Le repaire des criminels est opérationnel !");
    return db;
  } catch (err) {
    console.error("❌ Connexion MongoDB échouée:", err.message);
    throw err;
  }
}

function getDB() {
  if (!db) {
    throw new Error("⚠️  Base de données non connectée. Appelez connectDB() d'abord.");
  }
  return db;
}

async function closeDB() {
  await client.close();
  console.log("🔒 Connexion MongoDB fermée");
}

module.exports = { connectDB, getDB, closeDB };
