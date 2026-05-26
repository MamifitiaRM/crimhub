import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { usersAPI, eventsAPI } from "../services/api";
import toast from "react-hot-toast";

const BADGES = ["Criminel du Mois 🏆","Maître Incontesté 👑","Légende du Réseau ⭐","Terreur Fictive 😱","Génie Incompris 🧠"];

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");
  const [selectedBadge, setSelectedBadge] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, e, s] = await Promise.all([usersAPI.getAll(), eventsAPI.getAll(), usersAPI.getStats()]);
      setUsers(u); setEvents(e); setStats(s);
    } catch { toast.error("Erreur de chargement"); }
    finally { setLoading(false); }
  };

  const handleBan = async (uid) => {
    try { const d = await usersAPI.ban(uid); toast.success(d.message); fetchAll(); } catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleDel = async (uid) => {
    if (!window.confirm("💀 Supprimer ?")) return;
    try { await usersAPI.delete(uid); toast.success("💀 Supprimé"); fetchAll(); } catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleDelEvent = async (eid) => {
    if (!window.confirm("🗑️ Supprimer cette mission ?")) return;
    try { await eventsAPI.delete(eid); toast.success("Mission supprimée"); fetchAll(); } catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleBadge = async (uid) => {
    const badge = selectedBadge[uid]; if (!badge) return toast.error("Choisis un badge !");
    try { await usersAPI.setBadge(uid, badge); toast.success(`🏆 Badge attribué !`); fetchAll(); } catch (err) { toast.error(err.error || "Erreur"); }
  };

  const TABS = [{ k: "users", icon: "👥", l: "Utilisateurs" }, { k: "missions", icon: "🎯", l: "Missions" }, { k: "stats", icon: "📊", l: "Statistiques" }];

  return (
    <Layout title="PANNEAU ADMIN 👑" subtitle="Contrôle total du réseau criminel">
      {/* Admin banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: "16px 22px", marginBottom: "20px", background: "#FFD93D", border: "4px solid #0d0d0d", borderRadius: "14px", boxShadow: "6px 6px 0 #0d0d0d", display: "flex", alignItems: "center", gap: "14px" }}>
        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "2rem" }}>👑</motion.span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "#0d0d0d", letterSpacing: "0.08em" }}>ADMIN SUPRÊME — ACCÈS TOTAL</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#333" }}>Avec ce pouvoir vient une grande responsabilité fictive. 😂</div>
        </div>
        {stats && (
          <div style={{ display: "flex", gap: "16px" }}>
            {[{ v: stats.totalUsers, l: "Membres" }, { v: stats.totalEvents, l: "Missions" }, { v: stats.bannedUsers, l: "Bannis" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "#0d0d0d" }}>{s.v}</div>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "#333", textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", border: "3px solid #0d0d0d", borderRadius: "12px", overflow: "hidden", boxShadow: "4px 4px 0 #0d0d0d" }}>
        {TABS.map((t, i) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ flex: 1, padding: "12px 8px", background: tab === t.k ? "#FF6B35" : "var(--card-bg)", borderRight: i < 2 ? "3px solid #0d0d0d" : "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.06em", color: tab === t.k ? "white" : "var(--text2)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {t.icon} {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div>
      ) : (
        <>
          {tab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: u.isBanned ? "rgba(255,45,85,0.06)" : "var(--card-bg)", border: u.isBanned ? "2.5px solid rgba(255,45,85,0.4)" : "2.5px solid #0d0d0d", borderRadius: "12px", boxShadow: "3px 3px 0 #0d0d0d" }}>
                  <div style={{ width: "40px", height: "40px", background: u.role === "admin" ? "#FFD93D" : "#FF6B35", border: "2.5px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, boxShadow: "2px 2px 0 #0d0d0d" }}>
                    {u.role === "admin" ? "👑" : u.category?.split(" ")[1] || "😈"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: "14px" }}>
                      {u.username}
                      {u.isBanned && <span style={{ marginLeft: "8px", padding: "1px 7px", background: "#FF2D55", border: "1.5px solid #0d0d0d", borderRadius: "20px", fontSize: "9px", fontWeight: 800, color: "white" }}>🚫 BANNI</span>}
                      {u.role === "admin" && <span style={{ marginLeft: "8px", padding: "1px 7px", background: "#FFD93D", border: "1.5px solid #0d0d0d", borderRadius: "20px", fontSize: "9px", fontWeight: 800, color: "#0d0d0d" }}>👑 ADMIN</span>}
                      {u.badge && <span style={{ marginLeft: "8px", padding: "1px 7px", background: "#FFD93D", border: "1.5px solid #0d0d0d", borderRadius: "20px", fontSize: "9px", fontWeight: 800, color: "#0d0d0d" }}>🏆 {u.badge}</span>}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)" }}>{u.category} • ⭐{u.reputation || 0} • 🎯{u.missionsCompleted || 0}</div>
                  </div>
                  {u.role !== "admin" && (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <select className="form-input" style={{ padding: "5px 8px", fontSize: "11px", width: "auto", minWidth: "120px" }} value={selectedBadge[u._id] || ""} onChange={e => setSelectedBadge(p => ({ ...p, [u._id]: e.target.value }))}>
                        <option value="">Badge...</option>
                        {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <button onClick={() => handleBadge(u._id)} className="btn btn-yellow btn-sm">🏅</button>
                      <button onClick={() => handleBan(u._id)} className="btn btn-sm" style={{ background: u.isBanned ? "#06D6A0" : "#FF2D55", border: "2px solid #0d0d0d", color: "white", boxShadow: "2px 2px 0 #0d0d0d" }}>
                        {u.isBanned ? "🔓 Débannir" : "🔨 Bannir"}
                      </button>
                      <button onClick={() => handleDel(u._id)} className="btn btn-danger btn-sm">💀</button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "missions" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {events.map((e, i) => (
                <motion.div key={e._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "var(--card-bg)", border: "2.5px solid #0d0d0d", borderRadius: "12px", boxShadow: "3px 3px 0 #0d0d0d" }}>
                  {e.images?.[0] && <img src={e.images[0].data} alt="" style={{ width: "44px", height: "44px", objectFit: "cover", border: "2px solid #0d0d0d", borderRadius: "8px", flexShrink: 0 }} />}
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)" }}>📍 {e.location} • 🏷️ {e.type} • 👥 {e.participants?.length || 0} • par {e.creatorName}</div>
                  </div>
                  <div style={{ padding: "4px 10px", background: "var(--bg2)", border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, flexShrink: 0, boxShadow: "1px 1px 0 #0d0d0d" }}>
                    {new Date(e.date).toLocaleDateString("fr-FR")}
                  </div>
                  <button onClick={() => handleDelEvent(e._id)} className="btn btn-danger btn-sm">🗑️</button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "stats" && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {[{ title: "📊 SPÉCIALITÉS", items: stats.categories, total: stats.totalUsers, colors: ["#FF6B35","#8338EC","#118AB2","#06D6A0","#FF2D55"] },
                  { title: "🎯 TYPES DE MISSIONS", items: stats.missionTypes, total: stats.totalEvents, colors: ["#8338EC","#FF6B35","#118AB2","#FF2D55","#06D6A0"] }].map(section => (
                  <div key={section.title} className="card">
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "16px", color: "var(--text)" }}>{section.title}</h3>
                    {section.items?.map((item, i) => (
                      <div key={item._id} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 800, marginBottom: "5px" }}>
                          <span style={{ color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{item._id}</span>
                          <span style={{ color: section.colors[i % 5] }}>{item.count}</span>
                        </div>
                        <div style={{ height: "10px", background: "var(--bg3)", borderRadius: "5px", border: "2px solid #0d0d0d", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / Math.max(section.total, 1)) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.7 }}
                            style={{ height: "100%", background: section.colors[i % 5], borderRadius: "3px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </Layout>
  );
}
