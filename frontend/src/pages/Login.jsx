import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import CartoonScene3D from "../components/CartoonScene3D";
import ThemeToggle from "../components/ThemeToggle";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      toast.success(data.message || "Connexion réussie !");
      navigate("/dashboard");
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(err.error || "Identifiants incorrects !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {[{ color: "#FF6B35", x: "5%", y: "10%", s: 110 }, { color: "#FFD93D", x: "86%", y: "12%", s: 90 }, { color: "#8338EC", x: "8%", y: "78%", s: 130 }, { color: "#06D6A0", x: "83%", y: "72%", s: 100 }].map((b, i) => (
        <motion.div key={i} animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
          style={{ position: "fixed", left: b.x, top: b.y, width: b.s, height: b.s, background: b.color, borderRadius: "40% 60% 55% 45%", opacity: 0.15, pointerEvents: "none" }} />
      ))}

      <div style={{ width: "100%", maxWidth: "460px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: shake ? [0, -3, 3, -3, 0] : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ background: "var(--card-bg)", border: "4px solid #0d0d0d", borderRadius: "20px", boxShadow: "8px 8px 0 #0d0d0d", overflow: "hidden" }}
        >
          <div style={{ height: "10px", background: "repeating-linear-gradient(90deg,#FF6B35 0,#FF6B35 18px,#FFD93D 18px,#FFD93D 36px,#FF2D55 36px,#FF2D55 54px,#8338EC 54px,#8338EC 72px)", borderBottom: "3px solid #0d0d0d" }} />
          <CartoonScene3D height={200} />
          <div style={{ padding: "26px" }}>
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", letterSpacing: "0.12em", lineHeight: 1, marginBottom: "8px" }}>
                <span style={{ color: "#FF6B35", WebkitTextStroke: "2px #0d0d0d" }}>CRIME</span>
                <span style={{ color: "#FFD93D", WebkitTextStroke: "2px #0d0d0d" }}>HUB</span>
              </div>
              <div style={{ display: "inline-block", padding: "4px 14px", background: "#FF2D55", border: "2.5px solid #0d0d0d", borderRadius: "20px", fontSize: "11px", fontWeight: 800, color: "white", boxShadow: "3px 3px 0 #0d0d0d", letterSpacing: "0.08em" }}>
                🔐 ZONE ACCÈS RESTREINT
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">😈 Alias criminel</label>
                <input className="form-input" type="text" placeholder="Ton pseudonyme..." value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">🔑 Mot de passe secret</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.03, y: -2 } : {}} whileTap={{ scale: 0.95 }}
                style={{ width: "100%", marginTop: "6px", padding: "14px", background: loading ? "var(--bg3)" : "#FF6B35", border: "3px solid #0d0d0d", borderRadius: "12px", color: "white", fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-display)", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.1em", boxShadow: loading ? "none" : "5px 5px 0 #0d0d0d" }}>
                {loading ? "⏳ VÉRIFICATION..." : "😈 S'INFILTRER !"}
              </motion.button>
            </form>
            <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", fontWeight: 700, color: "var(--text3)" }}>
              Nouveau criminel ? <Link to="/register" style={{ color: "#FF6B35", fontWeight: 900, textDecoration: "none" }}>Rejoindre →</Link>
            </div>
            <div style={{ marginTop: "14px", padding: "8px 12px", background: "var(--bg2)", border: "2.5px solid #0d0d0d", borderRadius: "8px", boxShadow: "2px 2px 0 #0d0d0d", fontSize: "10px", fontWeight: 700, color: "var(--text3)", textAlign: "center" }}>
              ⚠️ Parodie 100% fictive — Aucun vrai crime 😂
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
