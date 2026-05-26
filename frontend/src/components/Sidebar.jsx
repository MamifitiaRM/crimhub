import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { path: "/dashboard",      icon: "🏠", label: "QG Principal",   color: "#FF6B35" },
  { path: "/missions",       icon: "🎯", label: "Missions",        color: "#8338EC" },
  { path: "/create-mission", icon: "➕", label: "Créer Mission",   color: "#06D6A0" },
  { path: "/criminals",      icon: "👥", label: "Le Réseau",       color: "#118AB2" },
  { path: "/leaderboard",    icon: "🏆", label: "Classement",      color: "#FFD93D" },
  { path: "/profile",        icon: "🦹", label: "Mon Profil",      color: "#FF6B9D" },
];

const EMOJIS = ["😈","🦹","💀","🎭","🏴‍☠️","🧠","🔥","🪙","💻","🍬"];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const emoji = EMOJIS[(user?.username?.length || 0) % EMOJIS.length];

  const handleLogout = () => {
    logout();
    toast.success("👋 À la prochaine, bandit !");
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: -270 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "var(--sidebar-width)", height: "100vh",
        background: isDark ? "#111118" : "#faf8f5",
        borderRight: "4px solid #0d0d0d",
        display: "flex", flexDirection: "column",
        zIndex: 100, overflow: "hidden",
      }}
    >
      <div style={{
        height: "8px",
        background: "repeating-linear-gradient(90deg,#FF6B35 0,#FF6B35 16px,#FFD93D 16px,#FFD93D 32px,#FF2D55 32px,#FF2D55 48px,#8338EC 48px,#8338EC 64px)",
        borderBottom: "3px solid #0d0d0d", flexShrink: 0,
      }} />

      <div style={{ padding: "16px 16px 12px", borderBottom: "3px solid #0d0d0d", flexShrink: 0 }}>
        <motion.div whileHover={{ scale: 1.04 }} onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "52px", height: "52px", background: "#FF6B35",
            border: "3px solid #0d0d0d", borderRadius: "12px",
            boxShadow: "4px 4px 0 #0d0d0d",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", flexShrink: 0, position: "relative",
          }}>
            <motion.span animate={{ rotate: [0,10,-10,0] }} transition={{ duration: 3, repeat: Infinity }}>🦹</motion.span>
            <div style={{
              position: "absolute", top: "6px", left: "6px",
              width: "12px", height: "7px", background: "rgba(255,255,255,0.4)",
              borderRadius: "4px", transform: "rotate(-30deg)",
            }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#FF6B35", lineHeight: 1, WebkitTextStroke: "1.5px #0d0d0d" }}>CRIME</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#FFD93D", lineHeight: 1, WebkitTextStroke: "1.5px #0d0d0d" }}>HUB</div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{
          margin: "12px 12px 6px", padding: "11px 13px",
          background: isDark ? "#1e1e2c" : "#f0ede8",
          border: "3px solid #0d0d0d", borderRadius: "12px",
          boxShadow: "3px 3px 0 #0d0d0d", flexShrink: 0,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.div animate={{ y: [0,-3,0] }} transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: "38px", height: "38px", background: "#FF6B35",
              border: "3px solid #0d0d0d", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", boxShadow: "2px 2px 0 #0d0d0d", flexShrink: 0,
            }}>
            {emoji}
          </motion.div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.username}</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: user?.role === "admin" ? "#FFD93D" : "#FF6B35" }}>
              {user?.role === "admin" ? "👑 ADMIN SUPRÊME" : user?.category?.split(" ")[0]}
            </div>
          </div>
        </div>
        {user?.badge && (
          <div style={{ marginTop: "7px", padding: "3px 10px", background: "#FFD93D", border: "2px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, boxShadow: "2px 2px 0 #0d0d0d", textAlign: "center", color: "#0d0d0d" }}>
            🏆 {user.badge}
          </div>
        )}
      </motion.div>

      <nav style={{ flex: 1, padding: "6px 10px", display: "flex", flexDirection: "column", gap: "3px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item, i) => (
          <motion.div key={item.path}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            onHoverStart={() => setHovered(item.path)}
            onHoverEnd={() => setHovered(null)}
          >
            <NavLink to={item.path} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "10px",
              textDecoration: "none", fontWeight: 800, fontSize: "13px",
              color: isActive ? "#0d0d0d" : "var(--text)",
              background: isActive ? item.color : "transparent",
              border: isActive ? "2.5px solid #0d0d0d" : "2.5px solid transparent",
              boxShadow: isActive ? "3px 3px 0 #0d0d0d" : "none",
              transform: isActive ? "translate(-1px,-1px)" : "none",
              transition: "all 0.12s cubic-bezier(0.34,1.56,0.64,1)",
            })}>
              {({ isActive }) => (<>
                <motion.span
                  animate={hovered === item.path && !isActive ? { scale: 1.3, rotate: 15 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{ fontSize: "1.1rem", flexShrink: 0 }}
                >{item.icon}</motion.span>
                <span>{item.label}</span>
                {isActive && <motion.div layoutId="activeIndicator" style={{ marginLeft: "auto", width: "7px", height: "7px", background: "#0d0d0d", borderRadius: "50%" }} />}
              </>)}
            </NavLink>
          </motion.div>
        ))}
        {user?.role === "admin" && (
          <>
            <div style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text3)", padding: "8px 12px 2px" }}>— Admin —</div>
            <NavLink to="/admin" style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px",
              textDecoration: "none", fontWeight: 800, fontSize: "13px",
              color: isActive ? "#0d0d0d" : "var(--text)",
              background: isActive ? "#FFD93D" : "transparent",
              border: isActive ? "2.5px solid #0d0d0d" : "2.5px solid transparent",
              boxShadow: isActive ? "3px 3px 0 #0d0d0d" : "none", transition: "all 0.12s ease",
            })}>
              <span style={{ fontSize: "1.1rem" }}>⚙️</span><span>Panneau Admin</span>
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ padding: "10px 12px 13px", borderTop: "3px solid #0d0d0d", display: "flex", flexDirection: "column", gap: "7px", flexShrink: 0 }}>
        <ThemeToggle />
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "9px 14px", background: "#FF2D55", border: "3px solid #0d0d0d",
            borderRadius: "10px", color: "white", cursor: "pointer",
            fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-body)",
            boxShadow: "3px 3px 0 #0d0d0d",
          }}>
          🚪 Déconnexion
        </motion.button>
        <div style={{ textAlign: "center", fontSize: "9px", fontWeight: 900, color: "var(--text3)", letterSpacing: "0.1em", fontFamily: "var(--font-display)" }}>
          CRIMEHUB v2.0 — FICTION ONLY 😂
        </div>
      </div>
    </motion.aside>
  );
}
