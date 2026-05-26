import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import MissionCard from "../components/MissionCard";
import CartoonScene3D from "../components/CartoonScene3D";
import TinyScene3D from "../components/TinyScene3D";
import { useAuth } from "../hooks/useAuth";
import { usersAPI, eventsAPI } from "../services/api";
import toast from "react-hot-toast";

const QUOTES = [
  "\"Le meilleur crime est celui dont personne ne parle... sauf sur CrimeHub.\"",
  "\"Un bon plan vaut mille coups de force brute.\"",
  "\"Les amateurs commettent des crimes. Les pros font des missions.\"",
  "\"Si tu rates ton coup, c'était une répétition.\"",
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    Promise.all([usersAPI.getStats(), eventsAPI.getAll()])
      .then(([s, m]) => { setStats(s); setMissions(m.slice(0, 6)); })
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { icon: "safe", label: "Criminels", value: stats?.totalUsers || 0, color: "#FF6B35", bg: "rgba(255,107,53,0.12)" },
    { icon: "bag", label: "Missions", value: stats?.totalEvents || 0, color: "#8338EC", bg: "rgba(131,56,236,0.12)" },
    { icon: "coin", label: "En cours", value: stats?.activeEvents || 0, color: "#06D6A0", bg: "rgba(6,214,160,0.12)" },
    { icon: "skull", label: "Bannis", value: stats?.bannedUsers || 0, color: "#FF2D55", bg: "rgba(255,45,85,0.12)" },
  ];

  return (
    <Layout title="QG PRINCIPAL" subtitle="Centre de commandement">
      {/* 3D scene banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "22px" }}>
        <div style={{ border: "4px solid #0d0d0d", borderRadius: "16px", overflow: "hidden", boxShadow: "6px 6px 0 #0d0d0d" }}>
          {/* Title strip */}
          <div style={{ padding: "14px 22px", background: "#FF6B35", borderBottom: "4px solid #0d0d0d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "white", letterSpacing: "0.1em", WebkitTextStroke: "1px #0d0d0d" }}>
                BIENVENUE, {user?.username?.toUpperCase()} !
              </div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>
                {user?.category} • ⭐ {user?.reputation || 0} pts de réputation
                {user?.badge && <span style={{ marginLeft: "10px" }}>🏆 {user.badge}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <motion.button whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-mission")}
                style={{ padding: "9px 18px", background: "#FFD93D", border: "3px solid #0d0d0d", borderRadius: "10px", fontFamily: "var(--font-display)", fontSize: "1rem", cursor: "pointer", color: "#0d0d0d", boxShadow: "3px 3px 0 #0d0d0d", letterSpacing: "0.06em" }}>
                ➕ NOUVELLE MISSION
              </motion.button>
              <motion.button whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/missions")}
                style={{ padding: "9px 18px", background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.6)", borderRadius: "10px", fontFamily: "var(--font-display)", fontSize: "1rem", cursor: "pointer", color: "white", letterSpacing: "0.06em" }}>
                🎯 VOIR TOUT
              </motion.button>
            </div>
          </div>
          {/* 3D Scene */}
          <CartoonScene3D height={220} />
        </div>
      </motion.div>

      {/* Stats grid with 3D icons */}
      <div className="stats-grid">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
            style={{ background: "var(--card-bg)" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
              <TinyScene3D type={s.icon} size={64} />
            </div>
            <div className="stat-number" style={{ color: s.color }}>
              {loading ? "—" : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Two-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "22px" }}>
        {/* Recent missions */}
        <div>
          <div className="section-header">
            <h2 className="section-title">🎯 MISSIONS RÉCENTES</h2>
            <button onClick={() => navigate("/missions")} className="btn btn-outline btn-sm">Voir toutes →</button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 800, color: "var(--text3)" }}>Chargement des missions...</div>
            </div>
          ) : missions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎯</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "8px" }}>AUCUNE MISSION</div>
              <div style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "16px" }}>Sois le premier à en créer une !</div>
              <button onClick={() => navigate("/create-mission")} className="btn btn-primary">➕ Créer la première mission</button>
            </motion.div>
          ) : (
            <div className="grid-auto">
              {missions.map((m, i) => <MissionCard key={m._id} mission={m} onUpdate={() => eventsAPI.getAll().then(d => setMissions(d.slice(0, 6)))} delay={i * 0.07} />)}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Top criminals */}
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              🏆 <span style={{ color: "#FFD93D" }}>TOP CRIMINELS</span>
            </h3>
            {stats?.topCriminals?.map((c, i) => {
              const podiumColors = ["#FFD93D", "#94a3b8", "#92400e"];
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <motion.div key={c._id} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/criminals/${c._id}`)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: i < (stats.topCriminals.length - 1) ? "2px solid var(--bg3)" : "none", cursor: "pointer" }}>
                  <div style={{ width: "30px", height: "30px", background: i < 3 ? podiumColors[i] : "var(--bg3)", border: "2.5px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, flexShrink: 0, boxShadow: "2px 2px 0 #0d0d0d" }}>
                    {i < 3 ? medals[i] : i + 1}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 800, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.username}</div>
                    <div style={{ fontSize: "10px", color: "var(--text3)", fontWeight: 700 }}>{c.category?.split(" ")[0]} · {c.missionsCompleted} missions</div>
                  </div>
                  {i === 0 && <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "16px" }}>👑</motion.span>}
                </motion.div>
              );
            })}
            <button onClick={() => navigate("/leaderboard")} className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>
              Voir le classement complet →
            </button>
          </div>

          {/* Category bars */}
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: "14px" }}>
              📊 <span style={{ color: "#118AB2" }}>SPÉCIALITÉS</span>
            </h3>
            {stats?.categories?.slice(0, 5).map((cat, i) => (
              <div key={cat._id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  <span style={{ color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{cat._id}</span>
                  <span style={{ color: "#FF6B35", fontFamily: "var(--font-display)", fontSize: "1rem" }}>{cat.count}</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg3)", borderRadius: "4px", border: "1.5px solid #0d0d0d", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.count / (stats?.totalUsers || 1)) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
                    style={{ height: "100%", background: ["#FF6B35","#8338EC","#118AB2","#06D6A0","#FF2D55"][i], borderRadius: "3px" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <motion.div
            animate={{ rotate: [-0.4, 0.4, -0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ padding: "16px", background: "#FFD93D", border: "3px solid #0d0d0d", borderRadius: "14px", boxShadow: "5px 5px 0 #0d0d0d" }}
          >
            <div style={{ fontFamily: "var(--font-marker)", fontSize: "0.85rem", color: "#0d0d0d", lineHeight: 1.7, marginBottom: "8px" }}>
              {quote}
            </div>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "#333", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              — Le Génie du Mal Anonyme
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
