import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import MissionCard from "../components/MissionCard";
import { eventsAPI } from "../services/api";
import toast from "react-hot-toast";

const TYPES = ["Tous","Cambriolage","Arnaque","Braquage","Piratage","Sabotage","Infiltration","Vol à la tire","Escroquerie","Coup de maître","Mission secrète"];
const TYPE_COLORS = { Tous:"#FF6B35", Cambriolage:"#FF6B35", Braquage:"#FF2D55", Arnaque:"#8338EC", Piratage:"#118AB2", Sabotage:"#FFD93D", Infiltration:"#06D6A0" };

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const navigate = useNavigate();

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== "Tous") params.type = filter;
      if (search) params.search = search;
      const data = await eventsAPI.getAll(params);
      let sorted = [...data];
      if (sortBy === "recent") sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else if (sortBy === "participants") sorted.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));
      else if (sortBy === "upcoming") sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMissions(sorted);
    } catch { toast.error("Erreur de chargement"); }
    finally { setLoading(false); }
  }, [filter, search, sortBy]);

  useEffect(() => { const t = setTimeout(fetchMissions, 300); return () => clearTimeout(t); }, [fetchMissions]);

  return (
    <Layout title="MISSIONS" subtitle={`${missions.length} mission(s) dans les archives`}>
      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px", padding: "14px 16px", background: "var(--card-bg)", border: "3px solid #0d0d0d", borderRadius: "14px", boxShadow: "4px 4px 0 #0d0d0d" }}>
        <div style={{ flex: "1 1 220px", position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
          <input className="form-input" style={{ paddingLeft: "36px" }} placeholder="Rechercher une mission..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: "auto", flex: "0 0 auto" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="recent">📅 Plus récentes</option>
          <option value="participants">👥 Plus de bandits</option>
          <option value="upcoming">⏰ Prochaines dates</option>
        </select>
        <motion.button whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.94 }}
          onClick={() => navigate("/create-mission")} className="btn btn-primary btn-sm">
          ➕ Créer
        </motion.button>
      </motion.div>

      {/* Type filters */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "22px" }}>
        {TYPES.map((type, i) => {
          const col = TYPE_COLORS[type] || "#666";
          const active = filter === type;
          return (
            <motion.button key={type}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.92 }}
              onClick={() => setFilter(type)}
              style={{
                padding: "6px 14px",
                background: active ? col : "var(--card-bg)",
                border: active ? `2.5px solid #0d0d0d` : `2.5px solid var(--bg3)`,
                borderRadius: "20px", color: active ? (type === "Sabotage" || type === "Tous" && active ? "#0d0d0d" : "white") : "var(--text2)",
                cursor: "pointer", fontSize: "12px", fontWeight: 800, fontFamily: "var(--font-body)",
                boxShadow: active ? "3px 3px 0 #0d0d0d" : "1px 1px 0 var(--bg3)",
                transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                transform: active ? "translate(-1px,-1px)" : "none",
              }}>
              {type}
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 14px" }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text3)" }}>CHARGEMENT DES MISSIONS...</div>
        </div>
      ) : missions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "60px 20px" }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "4rem", marginBottom: "14px" }}>🎯</motion.div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "8px" }}>
            {search ? "AUCUN RÉSULTAT" : "AUCUNE MISSION"}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text3)", marginBottom: "20px" }}>
            {search ? `Pas de mission pour "${search}"` : "Sois le premier à créer une mission !"}
          </div>
          <button onClick={() => navigate("/create-mission")} className="btn btn-primary btn-lg">
            ➕ Créer une mission
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid-auto">
            {missions.map((m, i) => <MissionCard key={m._id} mission={m} onUpdate={fetchMissions} delay={i * 0.05} />)}
          </div>
        </AnimatePresence>
      )}
    </Layout>
  );
}
