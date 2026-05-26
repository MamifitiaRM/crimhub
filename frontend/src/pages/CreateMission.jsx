import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import ImageUpload from "../components/ImageUpload";
import { eventsAPI } from "../services/api";
import toast from "react-hot-toast";

const TYPES = ["Cambriolage","Arnaque","Braquage","Piratage","Sabotage","Infiltration","Vol à la tire","Escroquerie","Coup de maître","Mission secrète"];
const DIFFICULTIES = [
  { v: "Facile", color: "#06D6A0", icon: "🟢" },
  { v: "Intermédiaire", color: "#FFD93D", icon: "🟡" },
  { v: "Difficile", color: "#FF6B35", icon: "🟠" },
  { v: "Légendaire", color: "#FF2D55", icon: "🔴" },
];
const LOCATIONS = ["Quartier des Ombres","Ruelles de Valdor","Tour Noire","Port Fantôme","Banque Centrale Fictive","Manoir Maudit","Entrepôt Abandonné Z","Sous-sol du Casino Royal","Musée de l'Improbable","Résidence du Maire Naïf"];
const TEMPLATES = [
  { title: "Opération Maison Rouge", type: "Cambriolage", desc: "Infiltrer la villa rouge du quartier des riches et s'emparer du tableau en chocolat. Attention au chien qui aboie en morse.", loc: "Quartier des Ombres" },
  { title: "Braquage de la Banque Fantôme", type: "Braquage", desc: "La Banque Fantôme détient des confettis dorés d'une valeur inestimable. Neutraliser les gardes avec des blagues nulles.", loc: "Banque Centrale Fictive" },
  { title: "Mission Vol de Cookies 🍪", type: "Vol à la tire", desc: "Grand-mère a encore fait des cookies. Danger extrême : sa vue est meilleure qu'on ne le pense.", loc: "Résidence du Maire Naïf" },
  { title: "Hack du Système Municipal", type: "Piratage", desc: "Pirater les serveurs et changer toutes les amendes en bons de réduction pour glaces.", loc: "Tour Noire" },
];

export default function CreateMission() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", location: "", date: "",
    type: "", difficulty: "Intermédiaire", reward: "",
    gains: "", equipment: "",
  });

  const applyTemplate = (t) => {
    setForm(f => ({ ...f, title: t.title, description: t.desc, type: t.type, location: t.loc }));
    toast("📋 Template appliqué !", { icon: "✨" });
  };

  const handleSubmit = async () => {
    if (!form.type) return toast.error("Choisis un type de mission !");
    if (!form.date) return toast.error("Indique une date !");
    if (!form.title || form.title.length < 5) return toast.error("Titre trop court (min 5 car.) !");
    setLoading(true);
    try {
      const payload = { ...form, images };
      const data = await eventsAPI.create(payload);
      toast.success(data.message || "Mission créée !");
      navigate(`/missions/${data.event._id}`);
    } catch (err) {
      toast.error(err.error || "Erreur de création");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["📋 Infos", "🗺️ Détails", "📷 Médias"];

  return (
    <Layout title="Créer une Mission" subtitle="Plan ton prochain coup 😈">

      {/* Templates */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "11px", fontWeight: 900, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>⚡ Templates rapides</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {TEMPLATES.map(t => (
            <motion.button key={t.title} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => applyTemplate(t)}
              style={{ padding: "7px 14px", background: "var(--card-bg)", border: "2.5px solid #0d0d0d", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-body)", boxShadow: "2px 2px 0 #0d0d0d" }}>
              ✨ {t.title.slice(0, 22)}...
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "0", marginBottom: "22px", border: "3px solid #0d0d0d", borderRadius: "12px", overflow: "hidden", boxShadow: "4px 4px 0 #0d0d0d" }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => { if (i < step - 1 || (i === step - 1)) return; if (i === step) setStep(i + 1); }}
            style={{
              flex: 1, padding: "13px 8px",
              background: step === i + 1 ? "#FF6B35" : step > i + 1 ? "#06D6A0" : "var(--card-bg)",
              borderRight: i < 2 ? "3px solid #0d0d0d" : "none",
              border: "none", cursor: "pointer",
              fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.06em",
              color: (step === i + 1 || step > i + 1) ? "white" : "var(--text2)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
            {step > i + 1 ? "✅" : s}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Main form */}
        <div>
          {/* STEP 1: Basic info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "20px", color: "#FF6B35" }}>
                📋 INFORMATIONS DE BASE
              </h2>
              <div className="form-group">
                <label className="form-label">Titre de la mission *</label>
                <input className="form-input" placeholder="ex: Opération Ombre Noire..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required minLength={5} />
              </div>
              <div className="form-group">
                <label className="form-label">Description détaillée *</label>
                <textarea className="form-input" placeholder="Décris le plan en détail — sois dramatique ! 😈" rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type de mission *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: "8px" }}>
                  {TYPES.map(type => (
                    <motion.button key={type} type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => setForm({ ...form, type })}
                      style={{
                        padding: "9px 10px",
                        background: form.type === type ? "#FF6B35" : "var(--bg2)",
                        border: form.type === type ? "2.5px solid #0d0d0d" : "2.5px solid var(--bg3)",
                        borderRadius: "8px", color: form.type === type ? "white" : "var(--text2)",
                        cursor: "pointer", fontSize: "12px", fontWeight: 800,
                        fontFamily: "var(--font-body)",
                        boxShadow: form.type === type ? "3px 3px 0 #0d0d0d" : "none",
                      }}>
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { if (!form.title || !form.type) return toast.error("Remplis le titre et le type !"); setStep(2); }}
                className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}>
                Suivant → Détails
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "20px", color: "#8338EC" }}>
                🗺️ DÉTAILS DU PLAN
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">📍 Lieu fictif *</label>
                  <input className="form-input" placeholder="Quartier des Ombres..." list="locs" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                  <datalist id="locs">{LOCATIONS.map(l => <option key={l} value={l} />)}</datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">📅 Date de la mission *</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">🏆 Récompense fictive</label>
                <input className="form-input" placeholder="1 tonne d'or imaginaire..." value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">💰 Gains estimés par membre</label>
                <input className="form-input" placeholder="ex: 250 000€ fictifs chacun..." value={form.gains} onChange={e => setForm({ ...form, gains: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">🛠️ Équipement requis</label>
                <input className="form-input" placeholder="ex: Grappin, masque, voiture rapide..." value={form.equipment} onChange={e => setForm({ ...form, equipment: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">⚡ Difficulté</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {DIFFICULTIES.map(d => (
                    <motion.button key={d.v} type="button" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => setForm({ ...form, difficulty: d.v })}
                      style={{
                        flex: 1, padding: "10px 6px",
                        background: form.difficulty === d.v ? d.color : "var(--bg2)",
                        border: form.difficulty === d.v ? "2.5px solid #0d0d0d" : "2.5px solid var(--bg3)",
                        borderRadius: "8px", color: form.difficulty === d.v ? (d.v === "Intermédiaire" ? "#0d0d0d" : "white") : "var(--text2)",
                        cursor: "pointer", fontSize: "11px", fontWeight: 800,
                        fontFamily: "var(--font-body)",
                        boxShadow: form.difficulty === d.v ? "3px 3px 0 #0d0d0d" : "none",
                      }}>
                      {d.icon} {d.v}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button onClick={() => setStep(1)} className="btn btn-outline">← Retour</button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { if (!form.location || !form.date) return toast.error("Lieu et date requis !"); setStep(3); }}
                  className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Suivant → Médias 📷
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Images */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "8px", color: "#06D6A0" }}>
                📷 MÉDIAS & PLANS
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text3)", fontWeight: 700, marginBottom: "18px" }}>
                Ajoute des photos du lieu, plans d'attaque, gains, équipe... (max 8 images)
              </p>
              <ImageUpload images={images} onChange={setImages} />
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={() => setStep(2)} className="btn btn-outline">← Retour</button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit} disabled={loading}
                  className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: "center" }}>
                  {loading ? "⏳ Création..." : "🎯 LANCER LA MISSION !"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "12px", color: "var(--text2)" }}>
              👁️ APERÇU
            </h3>
            <div style={{ padding: "12px", background: "var(--bg2)", border: "2px solid #0d0d0d", borderRadius: "10px", boxShadow: "2px 2px 0 #0d0d0d" }}>
              {form.type && (
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ padding: "3px 10px", background: "#FF6B35", border: "1.5px solid #0d0d0d", borderRadius: "20px", fontSize: "10px", fontWeight: 800, color: "white", boxShadow: "1px 1px 0 #0d0d0d" }}>{form.type}</span>
                </div>
              )}
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text)", minHeight: "22px", marginBottom: "5px" }}>
                {form.title || "Titre de la mission..."}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text3)", lineHeight: 1.5, minHeight: "34px" }}>
                {form.description ? form.description.slice(0, 90) + (form.description.length > 90 ? "..." : "") : "Description..."}
              </div>
              {form.location && <div style={{ fontSize: "11px", marginTop: "6px", color: "var(--text3)", fontWeight: 700 }}>📍 {form.location}</div>}
              {form.gains && <div style={{ fontSize: "11px", color: "#FFD93D", fontWeight: 800, marginTop: "4px" }}>💰 {form.gains}</div>}
              {images.length > 0 && <div style={{ fontSize: "11px", color: "#06D6A0", fontWeight: 800, marginTop: "4px" }}>📷 {images.length} image(s)</div>}
            </div>
          </div>

          {/* Danger notice */}
          <motion.div animate={{ rotate: [-0.5, 0.5, -0.5] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ padding: "14px", background: "#FF2D55", border: "3px solid #0d0d0d", borderRadius: "12px", boxShadow: "4px 4px 0 #0d0d0d", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>⚠️</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "white", letterSpacing: "0.08em", marginBottom: "4px" }}>AVERTISSEMENT</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.85)", fontWeight: 700, lineHeight: 1.5 }}>
              Fiction totale !<br />Aucun vrai crime.<br />Les flics peuvent dormir. 😂
            </div>
          </motion.div>

          {/* Tips */}
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", marginBottom: "10px", color: "var(--text2)" }}>💡 ASTUCES</h3>
            {["Ajoute un plan du lieu pour plus de style 🗺️", "Les gains motivent les participants 💰", "Choisis 'Légendaire' pour le drama 🔴", "Les photos rendent la mission épique 📷"].map((tip, i) => (
              <div key={i} style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)", padding: "5px 0", borderBottom: i < 3 ? "1.5px solid var(--bg3)" : "none" }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
