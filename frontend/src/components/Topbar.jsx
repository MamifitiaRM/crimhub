import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        height: "var(--header-height)",
        background: isDark ? "#191923" : "#faf8f5",
        borderBottom: "4px solid #0d0d0d",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 4px 0 #0d0d0d",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.6rem",
          letterSpacing: "0.08em",
          color: "var(--text)",
          lineHeight: 1.1,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            padding: "4px 12px",
            background: "#FFD93D",
            border: "2px solid #0d0d0d",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#0d0d0d",
            boxShadow: "2px 2px 0 #0d0d0d",
            whiteSpace: "nowrap",
          }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Online indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#06D6A0" }}>
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#06D6A0", border: "1.5px solid #0d0d0d" }}
          />
          EN LIGNE
        </div>

        {/* User pill */}
        <motion.div
          whileHover={{ scale: 1.04, y: -1 }}
          onClick={() => navigate("/profile")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "7px 13px",
            background: "#FF6B35",
            border: "3px solid #0d0d0d",
            borderRadius: "20px",
            cursor: "pointer",
            boxShadow: "3px 3px 0 #0d0d0d",
          }}
        >
          <div style={{
            width: "26px", height: "26px",
            background: "#FFD93D",
            border: "2px solid #0d0d0d",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.9rem",
          }}>
            {user?.category?.split(" ")[1] || "😈"}
          </div>
          <span style={{ fontSize: "13px", fontWeight: 900, color: "white" }}>
            {user?.username}
          </span>
          {user?.role === "admin" && <span style={{ fontSize: "12px" }}>👑</span>}
        </motion.div>
      </div>
    </motion.header>
  );
}
