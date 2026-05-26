import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08, rotate: 5 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 14px",
        background: isDark ? "#FFD93D" : "#191923",
        border: "3px solid #0d0d0d",
        borderRadius: "10px",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        fontWeight: 800, fontSize: "13px",
        color: isDark ? "#0d0d0d" : "#FFD93D",
        boxShadow: "3px 3px 0 #0d0d0d",
        transition: "all 0.15s ease",
        userSelect: "none",
      }}
    >
      <motion.span
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.4 }}
        style={{ fontSize: "16px" }}
      >
        {isDark ? "☀️" : "🌙"}
      </motion.span>
      {isDark ? "Clair" : "Sombre"}
    </motion.button>
  );
}
