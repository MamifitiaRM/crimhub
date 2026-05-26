import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "Cambrioleur 🏠", icon: "🏠", desc: "Spécialiste des entrées par effraction", color: "#FF6B35" },
  { value: "Pickpocket 🧤", icon: "🧤", desc: "Main légère, doigts agiles", color: "#8338EC" },
  { value: "Arnaqueur 💻", icon: "💻", desc: "Maître de la manipulation", color: "#118AB2" },
  { value: "Hacker 💻", icon: "🖥️", desc: "Pirate du cyberespace", color: "#06D6A0" },
  { value: "Escroc 🪙", icon: "🪙", desc: "Expert en fausses promesses", color: "#FFD93D" },
  { value: "Pirate 🏴‍☠️", icon: "🏴‍☠️", desc: "Terreur des sept mers", color: "#FF2D55" },
  { value: "Bandit masqué 🎭", icon: "🎭", desc: "Toujours incognito", color: "#FF6B9D" },
  { value: "Génie du mal 🧠", icon: "🧠", desc: "QI hors norme, plans diaboliques", color: "#8338EC" },
  { value: "Maître du chaos 🔥", icon: "🔥", desc: "Sème le désordre partout", color: "#FF6B35" },
  { value: "Voleur de bonbons 🍬", icon: "🍬", desc: "Parce que pourquoi pas 😂", color: "#FF6B9D" },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", password: "", category: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.category) return toast.error("Choisis ta spécialité !");
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(data.message || "Bienvenue dans le réseau !");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.error || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Floating blobs */}
      {[{ c: "#FF6B35", x: "8%", y: "8%", s: 100 }, { c: "#FFD93D", x: "85%", y: "10%", s: 80 }, { c: "#8338EC", x: "5%", y: "82%", s: 120 }, { c: "#06D6A0", x: "87%", y: "78%", s: 90 }].map((b, i) => (
        <motion.div key={i} animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i }}
          style={{ position: "fixed", left: b.x, top: b.y, width: b.s, height: b.s, background: b.c, borderRadius: "40% 60% 55% 45%", opacity: 0.14, pointerEvents: "none" }} />
      ))}

      <div style={{ width: "100%", maxWidth: step === 2 ? "640px" : "460px", transition: "max-width 0.4s ease" }}>
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          style={{ background: "var(--card-bg)", border: "4px solid #0d0d0d", borderRadius: "20px", boxShadow: "8px 8px 0 #0d0d0d", overflow: "hidden" }}
        >
          {/* Rainbow stripe */}
          <div style={{ height: "10px", background: "repeating-linear-gradient(90deg,#FF2D55 0,#FF2D55 16px,#FF6B35 16px,#FF6B35 32px,#FFD93D 32px,#FFD93D 48px,#06D6A0 48px,#06D6A0 64px,#8338EC 64px,#8338EC 80px)", borderBottom: "3px solid #0d0d0d" }} />

          {/* Step progress */}
          <div style={{ display: "flex", background: "var(--bg2)", borderBottom: "3px solid #0d0d0d" }}>
            {[{ n: 1, l: "Identité" }, { n: 2, l: "Spécialité" }].map((s) => (
              <div key={s.n} style={{ flex: 1, padding: "12px", textAlign: "center", background: step === s.n ? "#FF6B35" : step > s.n ? "#06D6A0" : "transparent", borderRight: s.n < 2 ? "3px solid #0d0d0d" : "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: step >= s.n ? "white" : "var(--text3)", letterSpacing: "0.06em" }}>
                  {step > s.n ? "✅" : `${s.n}.`} {s.l}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "28px" }}>
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: "2.8rem", display: "block", marginBottom: "6px" }}>⚡</motion.div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "0.1em" }}>
                <span style={{ color: "#FF2D55", WebkitTextStroke: "1.5px #0d0d0d" }}>REJOINDRE</span>{" "}
                <span style={{ color: "#FF6B35", WebkitTextStroke: "1.5px #0d0d0d" }}>LE RÉSEAU</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text3)", marginTop: "4px" }}>Étape {step} / 2</div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="form-group">
                    <label className="form-label">😈 Alias criminel</label>
                    <input className="form-input" type="text" placeholder="Ton nom de guerre..." value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} maxLength={20} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">🔑 Mot de passe (min. 6 caractères)</label>
                    <input className="form-input" type="password" placeholder="Un secret bien gardé..." value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">📜 Bio (optionnel)</label>
                    <textarea className="form-input" rows={3} placeholder="Décris ton parcours criminel fictif..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                  </div>
                  <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (!form.username || form.username.length < 3) return toast.error("Pseudo trop court !");
                      if (!form.password || form.password.length < 6) return toast.error("Mot de passe trop court !");
                      setStep(2);
                    }}
                    style={{ width: "100%", padding: "14px", background: "#FF6B35", border: "3px solid #0d0d0d", borderRadius: "12px", color: "white", fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-display)", cursor: "pointer", letterSpacing: "0.08em", boxShadow: "5px 5px 0 #0d0d0d" }}>
                    CHOISIR MA SPÉCIALITÉ →
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text3)", marginBottom: "14px", textAlign: "center" }}>
                    🎭 Quelle est ta spécialité criminelle ?
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "18px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
                    {CATEGORIES.map(cat => (
                      <motion.button key={cat.value} type="button" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setForm({ ...form, category: cat.value })}
                        style={{
                          padding: "13px 10px", textAlign: "left",
                          background: form.category === cat.value ? cat.color : "var(--bg2)",
                          border: form.category === cat.value ? "3px solid #0d0d0d" : "2.5px solid var(--bg3)",
                          borderRadius: "12px", cursor: "pointer", fontFamily: "var(--font-body)",
                          boxShadow: form.category === cat.value ? "4px 4px 0 #0d0d0d" : "2px 2px 0 var(--bg3)",
                          transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                          transform: form.category === cat.value ? "translate(-2px,-2px)" : "none",
                        }}>
                        <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{cat.icon}</div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: form.category === cat.value ? "white" : "var(--text)", marginBottom: "2px" }}>{cat.value.split(" ")[0]}</div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: form.category === cat.value ? "rgba(255,255,255,0.85)" : "var(--text3)", lineHeight: 1.3 }}>{cat.desc}</div>
                      </motion.button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: "0 0 auto" }}>← Retour</button>
                    <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }}
                      onClick={handleSubmit} disabled={loading || !form.category}
                      style={{
                        flex: 1, padding: "14px", background: !form.category ? "var(--bg3)" : "#FF6B35",
                        border: "3px solid #0d0d0d", borderRadius: "12px", color: "white",
                        fontSize: "17px", fontWeight: 800, fontFamily: "var(--font-display)",
                        cursor: !form.category ? "not-allowed" : "pointer", letterSpacing: "0.08em",
                        boxShadow: form.category ? "5px 5px 0 #0d0d0d" : "none",
                      }}>
                      {loading ? "⏳ CRÉATION..." : "😈 REJOINDRE LE RÉSEAU !"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", fontWeight: 700, color: "var(--text3)" }}>
              Déjà membre ? <Link to="/login" style={{ color: "#FF6B35", fontWeight: 900, textDecoration: "none" }}>S'infiltrer →</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
