import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { eventsAPI } from "../services/api";
import toast from "react-hot-toast";

const TYPE_CONFIG = {
  "Cambriolage":    { color: "#FF6B35", bg: "rgba(255,107,53,0.12)", icon: "🏠" },
  "Braquage":       { color: "#FF2D55", bg: "rgba(255,45,85,0.12)",  icon: "🏦" },
  "Arnaque":        { color: "#8338EC", bg: "rgba(131,56,236,0.12)", icon: "🎭" },
  "Piratage":       { color: "#118AB2", bg: "rgba(17,138,178,0.12)", icon: "💻" },
  "Sabotage":       { color: "#FFD93D", bg: "rgba(255,217,61,0.15)", icon: "💥" },
  "Infiltration":   { color: "#06D6A0", bg: "rgba(6,214,160,0.12)", icon: "🕵️" },
  "Vol à la tire":  { color: "#FF6B9D", bg: "rgba(255,107,157,0.12)", icon: "🧤" },
  "Escroquerie":    { color: "#FFD93D", bg: "rgba(255,217,61,0.15)", icon: "🪙" },
  "Coup de maître": { color: "#FFD93D", bg: "rgba(255,217,61,0.15)", icon: "🧠" },
  "Mission secrète":{ color: "#666699", bg: "rgba(102,102,153,0.12)", icon: "🔒" },
};

const DIFF_CONFIG = {
  "Facile":        { color: "#06D6A0", label: "FACILE" },
  "Intermédiaire": { color: "#FFD93D", label: "INTER." },
  "Difficile":     { color: "#FF6B35", label: "DIFFICILE" },
  "Légendaire":    { color: "#FF2D55", label: "LÉGENDAIRE" },
};

export default function MissionCard({ mission, onUpdate, delay = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isParticipant = mission.participants?.includes(user?.id);
  const isCreator = mission.creator === user?.id;
  const cfg = TYPE_CONFIG[mission.type] || { color: "#FF6B35", bg: "rgba(255,107,53,0.12)", icon: "🎯" };
  const diff = DIFF_CONFIG[mission.difficulty] || DIFF_CONFIG["Intermédiaire"];
  const isPast = new Date(mission.date) < new Date();
  const missionDate = new Date(mission.date).toLocaleDateString("fr-FR");

  // First image if any
  const coverImage = mission.images && mission.images.length > 0 ? mission.images[0].data : null;

  const handleJoin = async (e) => {
    e.stopPropagation();
    try { await eventsAPI.join(mission._id); toast.success("🎯 Mission rejointe !"); onUpdate?.(); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleLeave = async (e) => {
    e.stopPropagation();
    try { await eventsAPI.leave(mission._id); toast("🏃 Tu as quitté la mission.", { icon: "💨" }); onUpdate?.(); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("💥 Supprimer cette mission ?")) return;
    try { await eventsAPI.delete(mission._id); toast.success("💥 Mission détruite !"); onUpdate?.(); }
    catch (err) { toast.error(err.error || "Erreur"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 22 }}
      whileHover={{ y: -5, rotate: 0.5, transition: { duration: 0.15 } }}
      onClick={() => navigate(`/missions/${mission._id}`)}
      style={{
        background: "var(--card-bg)",
        border: "4px solid #0d0d0d",
        borderRadius: "16px",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "6px 6px 0 #0d0d0d",
        opacity: isPast ? 0.75 : 1,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image or color header */}
      {coverImage ? (
        <div style={{ height: "130px", overflow: "hidden", position: "relative", borderBottom: "3px solid #0d0d0d" }}>
          <img src={coverImage} alt="mission" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Comic overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(13,13,13,0.6) 100%)",
          }} />
          {/* Type badge floating on image */}
          <div style={{
            position: "absolute", top: "10px", left: "10px",
            display: "flex", alignItems: "center", gap: "5px",
            padding: "4px 10px",
            background: cfg.color,
            border: "2px solid #0d0d0d",
            borderRadius: "20px",
            fontSize: "11px", fontWeight: 800, color: "white",
            boxShadow: "2px 2px 0 #0d0d0d",
          }}>
            {cfg.icon} {mission.type}
          </div>
          {/* Image count badge */}
          {mission.images?.length > 1 && (
            <div style={{
              position: "absolute", top: "10px", right: "10px",
              padding: "3px 9px",
              background: "#FFD93D", border: "2px solid #0d0d0d",
              borderRadius: "20px", fontSize: "10px", fontWeight: 800, color: "#0d0d0d",
              boxShadow: "2px 2px 0 #0d0d0d",
            }}>
              📷 {mission.images.length}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          height: "8px",
          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
          borderBottom: "3px solid #0d0d0d",
        }} />
      )}

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Type + difficulty (no image case) */}
        {!coverImage && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "4px 10px",
              background: cfg.bg, color: cfg.color,
              border: `2px solid ${cfg.color}`,
              borderRadius: "20px", fontSize: "11px", fontWeight: 800,
              boxShadow: "2px 2px 0 #0d0d0d",
            }}>
              {cfg.icon} {mission.type}
            </div>
            <div style={{
              padding: "3px 9px",
              background: diff.color, color: "#0d0d0d",
              border: "2px solid #0d0d0d", borderRadius: "20px",
              fontSize: "10px", fontWeight: 800,
              boxShadow: "2px 2px 0 #0d0d0d",
            }}>
              {diff.label}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem", letterSpacing: "0.04em",
          color: "var(--text)", marginBottom: "6px", lineHeight: 1.2,
        }}>
          {mission.title}
        </h3>

        {/* Description */}
        <p style={{
          color: "var(--text2)", fontSize: "12px", lineHeight: 1.5,
          marginBottom: "10px", flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {mission.description}
        </p>

        {/* Meta row */}
        <div style={{
          display: "flex", gap: "10px",
          fontSize: "11px", fontWeight: 700, color: "var(--text3)",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}>
          <span>📍 {mission.location}</span>
          <span>📅 {missionDate}</span>
          {isPast && (
            <span style={{
              background: "var(--bg2)", border: "1.5px solid #0d0d0d",
              borderRadius: "10px", padding: "1px 7px", color: "var(--text3)",
            }}>TERMINÉE</span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "2.5px", background: "#0d0d0d", borderRadius: "2px", marginBottom: "10px" }} />

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text3)" }}>
              par <span style={{ color: cfg.color }}>{mission.creatorName}</span>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)" }}>
              👥 {mission.participants?.length || 0} bandit(s)
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
            {(isCreator || user?.role === "admin") && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDelete}
                style={{ padding: "6px 10px", background: "#FF2D55", border: "2px solid #0d0d0d", borderRadius: "8px", color: "white", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "12px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                🗑️
              </motion.button>
            )}
            {!isParticipant && !isCreator && !isPast ? (
              <motion.button whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.94 }} onClick={handleJoin}
                style={{ padding: "6px 12px", background: "#06D6A0", border: "2px solid #0d0d0d", borderRadius: "8px", color: "white", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "12px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                ➕ Rejoindre
              </motion.button>
            ) : isParticipant && !isCreator ? (
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={handleLeave}
                style={{ padding: "6px 12px", background: "#FF2D55", border: "2px solid #0d0d0d", borderRadius: "8px", color: "white", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "12px", boxShadow: "2px 2px 0 #0d0d0d" }}>
                🏃 Quitter
              </motion.button>
            ) : isCreator ? (
              <div style={{ padding: "6px 12px", background: "#FFD93D", border: "2px solid #0d0d0d", borderRadius: "8px", fontSize: "12px", fontWeight: 800, color: "#0d0d0d", boxShadow: "2px 2px 0 #0d0d0d" }}>
                ⭐ Chef
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
