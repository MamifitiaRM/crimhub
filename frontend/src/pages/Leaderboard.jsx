import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { usersAPI } from "../services/api";
import toast from "react-hot-toast";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    usersAPI.getLeaderboard().then(setLeaders).catch(() => toast.error("Erreur")).finally(() => setLoading(false));
  }, []);

  const PODIUM = [
    { rank: 1, medal: "🥇", bg: "#FFD93D", color: "#0d0d0d", height: "160px", size: 72 },
    { rank: 2, medal: "🥈", bg: "#94a3b8", color: "#fff", height: "120px", size: 60 },
    { rank: 3, medal: "🥉", bg: "#cd7c2c", color: "#fff", height: "100px", size: 54 },
  ];
  const podiumOrder = leaders.length >= 3 ? [leaders[1], leaders[0], leaders[2]] : [];
  const podiumConfigs = [PODIUM[1], PODIUM[0], PODIUM[2]];

  return (
    <Layout title="CLASSEMENT" subtitle="Les criminels les plus (fictivement) dangereux">
      {/* Podium */}
      {!loading && leaders.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "10px", marginBottom: "32px", padding: "24px 20px 0", background: "var(--card-bg)", border: "4px solid #0d0d0d", borderRadius: "16px 16px 0 0", boxShadow: "6px 0 0 #0d0d0d, -6px 0 0 #0d0d0d, 0 -6px 0 #0d0d0d" }}>
          {podiumOrder.map((leader, di) => {
            const cfg = podiumConfigs[di];
            return (
              <motion.div key={leader._id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.15 }}
                whileHover={{ y: -6 }} onClick={() => navigate(`/criminals/${leader._id}`)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flex: di === 1 ? "0 0 170px" : "0 0 140px" }}>
                <div style={{ fontSize: di === 1 ? "2.2rem" : "1.8rem", marginBottom: "6px" }}>{cfg.medal}</div>
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: di * 0.4 }}
                  style={{ width: cfg.size, height: cfg.size, background: cfg.bg, border: "3px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: di === 1 ? "2rem" : "1.6rem", marginBottom: "8px", boxShadow: "4px 4px 0 #0d0d0d" }}>
                  {leader.category?.split(" ")[1] || "😈"}
                </motion.div>
                <div style={{ fontWeight: 900, fontSize: di === 1 ? "15px" : "13px", textAlign: "center", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>{leader.username}</div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", marginBottom: "8px" }}>{leader.category?.split(" ")[0]}</div>
                <div style={{ width: di === 1 ? "120px" : "100px", height: cfg.height, background: cfg.bg, border: "3px solid #0d0d0d", borderRadius: "10px 10px 0 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: cfg.color, boxShadow: "4px 0 0 #0d0d0d, -4px 0 0 #0d0d0d, 0 -4px 0 #0d0d0d" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: di === 1 ? "2.5rem" : "2rem" }}>{cfg.rank}</div>
                  <div style={{ fontSize: "11px", fontWeight: 800 }}>{leader.missionsCompleted} missions</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Full list */}
      <div style={{ background: "var(--card-bg)", border: "4px solid #0d0d0d", borderTop: leaders.length >= 3 ? "3px dashed #0d0d0d" : "4px solid #0d0d0d", borderRadius: leaders.length >= 3 ? "0 0 16px 16px" : "16px", boxShadow: "6px 6px 0 #0d0d0d", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "#FF6B35", borderBottom: "3px solid #0d0d0d" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "white", letterSpacing: "0.1em", WebkitTextStroke: "1px #0d0d0d" }}>🏆 CLASSEMENT COMPLET</div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div>
        ) : (
          <div style={{ padding: "12px" }}>
            {leaders.map((leader, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const podColors = ["#FFD93D", "#94a3b8", "#cd7c2c"];
              return (
                <motion.div key={leader._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ x: 4 }} onClick={() => navigate(`/criminals/${leader._id}`)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", marginBottom: "6px", background: i < 3 ? `${podColors[i]}18` : "var(--bg2)", border: i < 3 ? `2.5px solid ${podColors[i]}` : "2.5px solid var(--bg3)", borderRadius: "12px", cursor: "pointer", boxShadow: "2px 2px 0 #0d0d0d", transition: "all 0.15s ease" }}>
                  <div style={{ width: "36px", height: "36px", background: i < 3 ? podColors[i] : "var(--bg3)", border: "2.5px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: i < 3 ? "1.1rem" : "0.9rem", color: i < 3 && i !== 1 ? "white" : "#0d0d0d", fontWeight: 900, flexShrink: 0, boxShadow: "2px 2px 0 #0d0d0d" }}>
                    {i < 3 ? medals[i] : i + 1}
                  </div>
                  <div style={{ width: "40px", height: "40px", background: "#FF6B35", border: "2.5px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, boxShadow: "2px 2px 0 #0d0d0d" }}>
                    {leader.category?.split(" ")[1] || "😈"}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 900, fontSize: "14px" }}>
                      {leader.username}
                      {leader.badge && <span style={{ marginLeft: "8px", padding: "2px 8px", background: "#FFD93D", border: "1.5px solid #0d0d0d", borderRadius: "20px", fontSize: "10px", fontWeight: 800, color: "#0d0d0d" }}>🏆 {leader.badge}</span>}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)" }}>{leader.category}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "#FFD93D" }}>⭐ {leader.reputation || 0}</div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)" }}>🎯 {leader.missionsCompleted || 0}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
