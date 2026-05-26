import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const IMAGE_TYPES = [
  { value: "plan", label: "📐 Plan du lieu", icon: "📐" },
  { value: "cible", label: "🏛️ La cible", icon: "🏛️" },
  { value: "gains", label: "💰 Les gains", icon: "💰" },
  { value: "equipe", label: "👥 L'équipe", icon: "👥" },
  { value: "fuite", label: "🚗 Chemin de fuite", icon: "🚗" },
  { value: "autre", label: "📸 Autre", icon: "📸" },
];

export default function ImageUpload({ images, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [labelMap, setLabelMap] = useState({});
  const inputRef = useRef(null);

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const maxSize = 3 * 1024 * 1024; // 3MB
    const allowed = Array.from(files).filter(f => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} n'est pas une image !`); return false; }
      if (f.size > maxSize) { toast.error(`${f.name} est trop grosse (max 3MB) !`); return false; }
      return true;
    });

    if (images.length + allowed.length > 8) {
      toast.error("Maximum 8 images par mission !");
      return;
    }

    allowed.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImg = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: labelMap[file.name] || "autre",
          data: e.target.result,
          size: file.size,
        };
        onChange(prev => [...prev, newImg]);
        toast.success(`📸 ${file.name} ajoutée !`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeImage = (id) => {
    onChange(prev => prev.filter(img => img.id !== id));
  };

  const updateType = (id, newType) => {
    onChange(prev => prev.map(img => img.id === id ? { ...img, type: newType } : img));
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`upload-zone ${dragging ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => processFiles(e.target.files)}
        />
        <motion.div
          animate={dragging ? { scale: 1.1 } : { scale: 1 }}
          style={{ pointerEvents: "none" }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
            {dragging ? "📂" : "📷"}
          </div>
          <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
            {dragging ? "Lâche pour ajouter !" : "Ajouter des images à la mission"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text3)", fontWeight: 700 }}>
            Plans, photos du lieu, gains, équipe... — Max 8 images · 3MB chacune
          </div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {IMAGE_TYPES.map(t => (
              <span key={t.value} style={{
                padding: "3px 10px", background: "var(--bg3)",
                border: "2px solid #0d0d0d", borderRadius: "20px",
                fontSize: "11px", fontWeight: 800, color: "var(--text2)",
                boxShadow: "1px 1px 0 #0d0d0d",
              }}>
                {t.icon} {t.label.split(" ").slice(1).join(" ")}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Preview grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: "14px" }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "8px",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                📷 {images.length} image(s) ajoutée(s)
              </span>
              <button
                onClick={() => onChange([])}
                style={{
                  padding: "3px 10px", background: "transparent",
                  border: "2px solid #0d0d0d", borderRadius: "8px",
                  fontSize: "11px", fontWeight: 800, cursor: "pointer",
                  color: "var(--text3)", fontFamily: "var(--font-body)",
                }}
              >
                Tout supprimer
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "10px",
            }}>
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    border: "3px solid #0d0d0d",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "3px 3px 0 #0d0d0d",
                    background: "var(--bg2)",
                  }}
                >
                  {/* Image */}
                  <div style={{ position: "relative", height: "100px" }}>
                    <img
                      src={img.data}
                      alt={img.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      style={{
                        position: "absolute", top: "4px", right: "4px",
                        width: "22px", height: "22px",
                        background: "#FF2D55",
                        border: "2px solid #0d0d0d",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", color: "white", fontWeight: 900,
                        boxShadow: "1px 1px 0 #0d0d0d",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Type selector */}
                  <div style={{ padding: "6px" }}>
                    <select
                      value={img.type}
                      onChange={e => updateType(img.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        background: "var(--bg)",
                        border: "2px solid #0d0d0d",
                        borderRadius: "6px",
                        fontSize: "11px", fontWeight: 700,
                        cursor: "pointer",
                        color: "var(--text)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {IMAGE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <div style={{
                      marginTop: "3px", fontSize: "9px", fontWeight: 700,
                      color: "var(--text3)", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {img.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
