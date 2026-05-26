// Criminals.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { usersAPI } from "../services/api";
import toast from "react-hot-toast";

const CAT_COLORS = { "Cambrioleur":"#FF6B35","Pickpocket":"#8338EC","Arnaqueur":"#118AB2","Hacker":"#06D6A0","Escroc":"#FFD93D","Pirate":"#FF2D55","Bandit":"#FF6B9D","Génie":"#8338EC","Maître":"#FF6B35","Voleur":"#FF6B9D" };

export default function Criminals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    usersAPI.getAll().then(setUsers).catch(() => toast.error("Erreur")).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="LE RÉSEAU CRIMINEL" subtitle={`${users.length} membres actifs`}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
        <input className="form-input" style={{ paddingLeft: "40px" }} placeholder="Rechercher par alias ou spécialité..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
          {filtered.map((u, i) => {
            const catKey = u.category?.split(" ")[0] || "Génie";
            const color = CAT_COLORS[catKey] || "#FF6B35";
            return (
              <motion.div key={u._id}
                initial={{ opacity: 0, y: 20, rotate: i % 2 === 0 ? -1 : 1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, rotate: i % 2 === 0 ? -1 : 1 }}
                onClick={() => navigate(`/criminals/${u._id}`)}
                style={{ background: "var(--card-bg)", border: "4px solid #0d0d0d", borderRadius: "16px", padding: 0, cursor: "pointer", overflow: "hidden", boxShadow: "5px 5px 0 #0d0d0d", opacity: u.isBanned ? 0.7 : 1 }}>
                {/* Color top */}
                <div style={{ height: "8px", background: color, borderBottom: "3px solid #0d0d0d" }} />
                <div style={{ padding: "16px" }}>
                  {u.isBanned && (
                    <div style={{ marginBottom: "8px", padding: "3px 10px", background: "#FF2D55", border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "10px", fontWeight: 800, color: "white", display: "inline-block", boxShadow: "2px 2px 0 #0d0d0d" }}>🚫 BANNI</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                      style={{ width: "52px", height: "52px", background: color, border: "3px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "3px 3px 0 #0d0d0d", flexShrink: 0 }}>
                      {u.category?.split(" ")[1] || "😈"}
                    </motion.div>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontWeight: 900, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</div>
                      {u.title && <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", fontStyle: "italic" }}>"{u.title}"</div>}
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", background: color, border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "white", display: "inline-block", boxShadow: "2px 2px 0 #0d0d0d", marginBottom: "8px" }}>
                    {u.category}
                  </div>
                  {u.badge && (
                    <div style={{ padding: "3px 10px", background: "#FFD93D", border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "10px", fontWeight: 800, display: "inline-block", marginLeft: "6px", boxShadow: "2px 2px 0 #0d0d0d", color: "#0d0d0d" }}>
                      🏆 {u.badge}
                    </div>
                  )}
                  {u.bio && <p style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 700, lineHeight: 1.5, marginTop: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{u.bio}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "2px solid var(--bg3)", fontSize: "11px", fontWeight: 800, color: "var(--text3)" }}>
                    <span>⭐ {u.reputation || 0}</span>
                    <span>🎯 {u.missionsCompleted || 0}</span>
                    {u.role === "admin" && <span style={{ color: "#FFD93D" }}>👑 ADMIN</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">👥</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>AUCUN CRIMINEL TROUVÉ</p>
        </div>
      )}
    </Layout>
  );
}
