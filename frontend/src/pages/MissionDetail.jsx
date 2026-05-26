import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import { eventsAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const DIFF_CFG = { Facile:{ c:"#06D6A0",icon:"🟢" }, Intermédiaire:{ c:"#FFD93D",icon:"🟡" }, Difficile:{ c:"#FF6B35",icon:"🟠" }, Légendaire:{ c:"#FF2D55",icon:"🔴" } };
const TYPE_CFG = { Cambriolage:"#FF6B35", Braquage:"#FF2D55", Arnaque:"#8338EC", Piratage:"#118AB2", Sabotage:"#FFD93D", Infiltration:"#06D6A0" };

const IMG_LABELS = { plan:"📐 Plan du lieu", cible:"🏛️ La cible", gains:"💰 Les gains", equipe:"👥 L'équipe", fuite:"🚗 Chemin de fuite", autre:"📸 Autre" };

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => { fetchMission(); }, [id]);

  const fetchMission = async () => {
    try {
      const data = await eventsAPI.getById(id);
      setMission(data);
      setEditForm({ title: data.title, description: data.description, location: data.location, date: new Date(data.date).toISOString().split("T")[0], type: data.type, difficulty: data.difficulty, reward: data.reward || "" });
    } catch { toast.error("Mission introuvable !"); navigate("/missions"); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    try { await eventsAPI.join(id); toast.success("🎯 Mission rejointe !"); fetchMission(); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleLeave = async () => {
    try { await eventsAPI.leave(id); toast("🏃 Tu as quitté la mission.", { icon: "💨" }); fetchMission(); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleDelete = async () => {
    if (!window.confirm("💥 Supprimer cette mission ?")) return;
    try { await eventsAPI.delete(id); toast.success("💥 Mission détruite !"); navigate("/missions"); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleSave = async () => {
    setSaving(true);
    try { await eventsAPI.update(id, editForm); toast.success("✅ Mission mise à jour !"); setEditing(false); fetchMission(); }
    catch (err) { toast.error(err.error || "Erreur"); }
    finally { setSaving(false); }
  };

  if (loading) return <Layout title="Chargement..."><div style={{ textAlign: "center", padding: "80px" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div></Layout>;
  if (!mission) return null;

  const isParticipant = mission.participants?.includes(user?.id);
  const isCreator = mission.creator === user?.id;
  const isAdmin = user?.role === "admin";
  const isPast = new Date(mission.date) < new Date();
  const diff = DIFF_CFG[mission.difficulty] || DIFF_CFG["Intermédiaire"];
  const typeColor = TYPE_CFG[mission.type] || "#FF6B35";
  const hasImages = mission.images && mission.images.length > 0;

  return (
    <Layout title={mission.title} subtitle={`Par ${mission.creatorName}`}>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", cursor: "pointer" }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              style={{ maxWidth: "90vw", maxHeight: "85vh", border: "4px solid #0d0d0d", borderRadius: "16px", boxShadow: "8px 8px 0 #0d0d0d", overflow: "hidden" }}>
              <img src={lightboxImg.data} alt={lightboxImg.name} style={{ display: "block", maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain" }} />
            </motion.div>
            <div style={{ position: "absolute", top: "20px", right: "20px", background: "#FF2D55", border: "3px solid #0d0d0d", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer", boxShadow: "3px 3px 0 #0d0d0d" }}>✕</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ x: -3 }} onClick={() => navigate("/missions")} className="btn btn-ghost btn-sm" style={{ marginBottom: "18px" }}>
        ← Retour aux missions
      </motion.button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: "20px" }}>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Color banner */}
            <div style={{ height: "10px", background: `linear-gradient(90deg, ${typeColor}, ${typeColor}88)`, borderBottom: "3px solid #0d0d0d" }} />
            <div style={{ padding: "20px" }}>
              {!editing ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ padding: "4px 12px", background: typeColor, border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "white", boxShadow: "2px 2px 0 #0d0d0d" }}>{mission.type}</div>
                      <div style={{ padding: "4px 12px", background: diff.c, border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "#0d0d0d", boxShadow: "2px 2px 0 #0d0d0d" }}>{diff.icon} {mission.difficulty}</div>
                      {isPast && <div style={{ padding: "4px 12px", background: "var(--bg3)", border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "var(--text3)", boxShadow: "2px 2px 0 #0d0d0d" }}>TERMINÉE</div>}
                      {isParticipant && <div style={{ padding: "4px 12px", background: "#06D6A0", border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "white", boxShadow: "2px 2px 0 #0d0d0d" }}>✅ INSCRIT</div>}
                    </div>
                    {(isCreator || isAdmin) && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">✏️ Modifier</button>
                        <button onClick={handleDelete} className="btn btn-danger btn-sm">🗑️ Supprimer</button>
                      </div>
                    )}
                  </div>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "0.06em", marginBottom: "12px", lineHeight: 1.1 }}>{mission.title}</h1>
                  <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.8, marginBottom: "20px" }}>{mission.description}</p>

                  {/* Info grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                    {[
                      { icon: "📍", label: "Lieu", value: mission.location },
                      { icon: "📅", label: "Date", value: new Date(mission.date).toLocaleDateString("fr-FR", { dateStyle: "long" }) },
                      { icon: "👤", label: "Créateur", value: mission.creatorName },
                      { icon: "👥", label: "Participants", value: `${mission.participants?.length || 0} bandit(s)` },
                    ].map(item => (
                      <div key={item.label} style={{ padding: "12px", background: "var(--bg2)", border: "2.5px solid #0d0d0d", borderRadius: "10px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{item.icon} {item.label}</div>
                        <div style={{ fontSize: "13px", fontWeight: 800 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Extra fields */}
                  {mission.gains && (
                    <div style={{ marginBottom: "10px", padding: "12px 14px", background: "#FFD93D", border: "3px solid #0d0d0d", borderRadius: "10px", boxShadow: "3px 3px 0 #0d0d0d" }}>
                      <div style={{ fontSize: "11px", fontWeight: 900, color: "#0d0d0d", textTransform: "uppercase", marginBottom: "3px" }}>💰 Gains par membre</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0d0d0d" }}>{mission.gains}</div>
                    </div>
                  )}
                  {mission.equipment && (
                    <div style={{ marginBottom: "10px", padding: "12px 14px", background: "var(--bg2)", border: "2.5px solid #0d0d0d", borderRadius: "10px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", marginBottom: "3px" }}>🛠️ Équipement requis</div>
                      <div style={{ fontSize: "13px", fontWeight: 700 }}>{mission.equipment}</div>
                    </div>
                  )}
                  {mission.reward && (
                    <div style={{ padding: "12px 14px", background: "var(--bg2)", border: "2.5px solid #0d0d0d", borderRadius: "10px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", marginBottom: "3px" }}>🏆 Récompense fictive</div>
                      <div style={{ fontSize: "13px", fontWeight: 700 }}>{mission.reward}</div>
                    </div>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "18px", color: "#FF6B35" }}>✏️ MODIFIER LA MISSION</h2>
                  <div className="form-group"><label className="form-label">Titre</label><input className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={4} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-group"><label className="form-label">Lieu</label><input className="form-input" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Récompense</label><input className="form-input" value={editForm.reward} onChange={e => setEditForm({ ...editForm, reward: e.target.value })} /></div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setEditing(false)} className="btn btn-outline">Annuler</button>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? "⏳..." : "✅ Sauvegarder"}</button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Image gallery */}
          {hasImages && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "14px" }}>
                📷 <span style={{ color: "#118AB2" }}>DOSSIER MISSION</span>
                <span style={{ marginLeft: "10px", fontSize: "0.8rem", padding: "2px 10px", background: "#118AB2", border: "2px solid #0d0d0d", borderRadius: "20px", color: "white", boxShadow: "2px 2px 0 #0d0d0d" }}>{mission.images.length} fichier(s)</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
                {mission.images.map((img, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: i * 0.07 }}
                    whileHover={{ scale: 1.04, rotate: 1, y: -3 }}
                    onClick={() => setLightboxImg(img)}
                    style={{ border: "3px solid #0d0d0d", borderRadius: "10px", overflow: "hidden", cursor: "zoom-in", boxShadow: "4px 4px 0 #0d0d0d", background: "var(--bg2)" }}>
                    <div style={{ height: "110px", overflow: "hidden" }}>
                      <img src={img.data} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "6px 8px", background: "var(--bg2)", borderTop: "2px solid #0d0d0d" }}>
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text2)" }}>{IMG_LABELS[img.type] || img.type}</div>
                      <div style={{ fontSize: "9px", color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Participants */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "14px" }}>👥 <span style={{ color: "#8338EC" }}>ÉQUIPE CRIMINELLE</span></h3>
            {mission.participantsData?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {mission.participantsData.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 4, borderColor: "#FF6B35" }}
                    onClick={() => navigate(`/criminals/${p._id}`)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 13px", background: "var(--bg2)", border: "2.5px solid #0d0d0d", borderRadius: "10px", cursor: "pointer", boxShadow: "2px 2px 0 #0d0d0d", transition: "all 0.15s ease" }}>
                    <div style={{ width: "38px", height: "38px", background: "#FF6B35", border: "2.5px solid #0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, boxShadow: "2px 2px 0 #0d0d0d" }}>
                      {p.category?.split(" ")[1] || "😈"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "14px" }}>
                        {p.username}
                        {mission.creator === p._id?.toString() && <span style={{ marginLeft: "8px", padding: "2px 8px", background: "#FFD93D", border: "1.5px solid #0d0d0d", borderRadius: "20px", fontSize: "10px", fontWeight: 800, color: "#0d0d0d", boxShadow: "1px 1px 0 #0d0d0d" }}>⭐ CHEF</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 700 }}>{p.category}</div>
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#FF6B35" }}>⭐ {p.reputation}</div>
                  </motion.div>
                ))}
              </div>
            ) : <p style={{ color: "var(--text3)", fontWeight: 700 }}>Aucun participant pour l'instant...</p>}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Action card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
              {mission.type === "Braquage" ? "🏦" : mission.type === "Piratage" ? "💻" : mission.type === "Cambriolage" ? "🏠" : mission.type === "Arnaque" ? "🎭" : "🎯"}
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", color: "var(--text2)", marginBottom: "14px" }}>STATUT MISSION</h3>
            {!isPast ? (
              isCreator ? (
                <div style={{ padding: "12px", background: "#06D6A0", border: "3px solid #0d0d0d", borderRadius: "10px", fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "white", letterSpacing: "0.06em", boxShadow: "3px 3px 0 #0d0d0d" }}>
                  ⭐ TU ES LE CERVEAU
                </div>
              ) : isParticipant ? (
                <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={handleLeave}
                  style={{ width: "100%", padding: "13px", background: "#FF2D55", border: "3px solid #0d0d0d", borderRadius: "10px", color: "white", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.06em", boxShadow: "4px 4px 0 #0d0d0d" }}>
                  🏃 QUITTER
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={handleJoin}
                  style={{ width: "100%", padding: "13px", background: "#06D6A0", border: "3px solid #0d0d0d", borderRadius: "10px", color: "white", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "0.06em", boxShadow: "4px 4px 0 #0d0d0d" }}>
                  🎯 REJOINDRE !
                </motion.button>
              )
            ) : (
              <div style={{ padding: "12px", background: "var(--bg3)", border: "2.5px solid #0d0d0d", borderRadius: "10px", fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--text3)", boxShadow: "2px 2px 0 #0d0d0d" }}>
                ⏱️ MISSION TERMINÉE
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", color: "var(--text2)", marginBottom: "12px" }}>📊 DONNÉES</h3>
            {[
              { l: "Participants", v: mission.participants?.length || 0, icon: "👥" },
              { l: "Type", v: mission.type, icon: "🏷️" },
              { l: "Difficulté", v: mission.difficulty, icon: diff.icon },
              { l: "Images", v: mission.images?.length || 0, icon: "📷" },
            ].map(item => (
              <div key={item.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1.5px solid var(--bg3)" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text3)" }}>{item.icon} {item.l}</span>
                <span style={{ fontSize: "13px", fontWeight: 800 }}>{item.v}</span>
              </div>
            ))}
            <div style={{ marginTop: "10px", fontSize: "10px", fontWeight: 700, color: "var(--text3)" }}>
              Créée le {new Date(mission.createdAt).toLocaleDateString("fr-FR")}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
