// Profile.jsx — paste this entire file content
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import MissionCard from "../components/MissionCard";
import { usersAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const CATS = ["Cambrioleur 🏠","Pickpocket 🧤","Arnaqueur 💻","Hacker 💻","Escroc 🪙","Pirate 🏴‍☠️","Bandit masqué 🎭","Génie du mal 🧠","Maître du chaos 🔥","Voleur de bonbons 🍬"];

export default function Profile() {
  const { id } = useParams();
  const { user: cu, updateUser } = useAuth();
  const navigate = useNavigate();
  const tid = id || cu?.id;
  const isOwn = !id || id === cu?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState({ username: "", category: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch_(); }, [tid]);

  const fetch_ = async () => {
    try { const d = await usersAPI.getById(tid); setProfile(d); setEf({ username: d.username, category: d.category, bio: d.bio || "" }); }
    catch { toast.error("Profil introuvable"); navigate("/criminals"); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try { await usersAPI.update(tid, ef); toast.success("✅ Profil mis à jour !"); setEditing(false); updateUser({ username: ef.username, category: ef.category }); fetch_(); }
    catch (err) { toast.error(err.error || "Erreur"); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!window.confirm("💀 Supprimer ton compte ?")) return;
    try { await usersAPI.delete(tid); toast.success("💀 Compte supprimé."); navigate("/login"); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };

  if (loading) return <Layout title="Profil"><div style={{ textAlign: "center", padding: "80px" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div></Layout>;
  if (!profile) return null;

  return (
    <Layout title={isOwn ? "MON PROFIL" : `PROFIL — ${profile.username}`}>
      {!isOwn && <motion.button whileHover={{ x: -3 }} onClick={() => navigate("/criminals")} className="btn btn-ghost btn-sm" style={{ marginBottom: "18px" }}>← Retour</motion.button>}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px" }}>
        {/* Profile card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ textAlign: "center", padding: 0, overflow: "hidden" }}>
            <div style={{ height: "8px", background: "repeating-linear-gradient(90deg,#FF6B35 0,#FF6B35 14px,#FFD93D 14px,#FFD93D 28px)", borderBottom: "3px solid #0d0d0d" }} />
            <div style={{ padding: "20px" }}>
              {profile.isBanned && <div style={{ marginBottom: "10px", padding: "4px 14px", background: "#FF2D55", border: "2.5px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "white", display: "inline-block", boxShadow: "2px 2px 0 #0d0d0d" }}>🚫 BANNI</div>}
              <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ width: "80px", height: "80px", background: "#FF6B35", border: "4px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", margin: "0 auto 14px", boxShadow: "4px 4px 0 #0d0d0d" }}>
                {profile.category?.split(" ")[1] || "😈"}
              </motion.div>
              {!editing ? (
                <>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", letterSpacing: "0.06em", marginBottom: "4px" }}>{profile.username}</div>
                  {profile.title && <div style={{ fontSize: "11px", fontWeight: 700, fontStyle: "italic", color: "var(--text3)", marginBottom: "8px" }}>"{profile.title}"</div>}
                  <div style={{ padding: "5px 14px", background: "#FF6B35", border: "2.5px solid #0d0d0d", borderRadius: "20px", fontSize: "12px", fontWeight: 800, color: "white", display: "inline-block", boxShadow: "2px 2px 0 #0d0d0d", marginBottom: "10px" }}>{profile.category}</div>
                  {profile.badge && (
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ padding: "4px 12px", background: "#FFD93D", border: "2.5px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, display: "inline-block", marginLeft: "6px", boxShadow: "2px 2px 0 #0d0d0d", color: "#0d0d0d" }}>
                      🏆 {profile.badge}
                    </motion.div>
                  )}
                  {profile.bio && <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)", lineHeight: 1.6, margin: "12px 0", textAlign: "left" }}>{profile.bio}</p>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "14px 0" }}>
                    {[{ l: "Réputation", v: `⭐ ${profile.reputation || 0}`, c: "#FFD93D" }, { l: "Missions", v: `🎯 ${profile.missionsCompleted || 0}`, c: "#FF6B35" }].map(s => (
                      <div key={s.l} style={{ padding: "10px", background: "var(--bg2)", border: "2.5px solid #0d0d0d", borderRadius: "10px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)", marginBottom: "14px" }}>
                    Membre depuis {new Date(profile.joinedAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                  </div>
                  {isOwn && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                      <button onClick={() => setEditing(true)} className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>✏️ Modifier le profil</button>
                      <button onClick={del} className="btn btn-danger btn-sm" style={{ width: "100%", justifyContent: "center" }}>💀 Supprimer mon compte</button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "left" }}>
                  <div className="form-group"><label className="form-label">Alias</label><input className="form-input" value={ef.username} onChange={e => setEf({ ...ef, username: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={3} value={ef.bio} onChange={e => setEf({ ...ef, bio: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Spécialité</label><select className="form-input" value={ef.category} onChange={e => setEf({ ...ef, category: e.target.value })}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setEditing(false)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Annuler</button>
                    <button onClick={save} disabled={saving} className="btn btn-primary btn-sm" style={{ flex: 1 }}>{saving ? "⏳..." : "✅ Sauver"}</button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          {profile.role === "admin" && (
            <motion.div animate={{ rotate: [-0.5, 0.5, -0.5] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ padding: "14px", background: "#FFD93D", border: "3px solid #0d0d0d", borderRadius: "12px", boxShadow: "4px 4px 0 #0d0d0d", textAlign: "center", fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", color: "#0d0d0d" }}>
              👑 ADMIN SUPRÊME DU RÉSEAU
            </motion.div>
          )}
        </div>

        {/* Missions */}
        <div>
          <div className="section-header">
            <h2 className="section-title">🎯 MISSIONS CRÉÉES</h2>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text3)" }}>{profile.missions?.length || 0}</span>
          </div>
          {profile.missions?.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎯</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "6px" }}>AUCUNE MISSION</div>
              {isOwn && <button onClick={() => navigate("/create-mission")} className="btn btn-primary" style={{ marginTop: "10px" }}>Créer une mission</button>}
            </div>
          ) : (
            <div className="grid-auto">
              {profile.missions?.map((m, i) => <MissionCard key={m._id} mission={m} onUpdate={fetch_} delay={i * 0.07} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
