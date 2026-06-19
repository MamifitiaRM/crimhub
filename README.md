# 🦹 CrimeHub v2.0 — Villains Network

> **Plateforme satirique et humoristique** — Réseau social cartoon pour personnages fictifs malveillants.
> Style : Comic Book / Cartoon 3D / Toon shading.
> ⚠️ Fiction totale. Humour uniquement. Aucun vrai crime. 😂

---

## 🎨 Nouvelles features v2.0

| Feature | Détail |
|---------|--------|
| 🎨 **UI Cartoon** | Style comic book, polices Bangers + Nunito, borders noires épaisses |
| 🌗 **Mode clair/sombre** | Toggle persistent (localStorage), gris clair ou gris foncé |
| 🧊 **Three.js 3D** | Scène 3D toon-shading sur la page login et dashboard |
| 🎭 **Mini icônes 3D** | Coffre-fort, sac, bombe, pièce… animés dans les stats |
| 📷 **Upload d'images** | Jusqu'à 8 images par mission (plan, cible, gains, équipe…) |
| 🔍 **Lightbox** | Visualisation plein écran des images de mission |
| 🎯 **Étapes de création** | Wizard 3 étapes pour créer une mission |
| 💰 **Champs détaillés** | Gains par membre, équipement requis |
| 🎪 **Animations** | Framer Motion partout — bounce, wobble, float |

---

## 🏗️ Architecture

```
crimehub/
├── backend/                    # Node.js + Express + MongoDB natif
│   ├── controllers/
│   │   ├── authController.js   # Inscription / Connexion JWT
│   │   ├── userController.js   # CRUD users + stats + ban + badge
│   │   └── eventController.js  # CRUD missions + images + participation
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── adminAuth.js        # Role admin check
│   ├── database/
│   │   └── connection.js       # MongoClient (ZÉRO ODM)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── events.js
│   ├── scripts/
│   │   └── seed.js             # 8 criminels fictifs + 7 missions
│   ├── Dockerfile
│   ├── .env
│   └── server.js               # Express (30MB limit pour images)
│
└── frontend/                   # React 18
    └── src/
        ├── components/
        │   ├── CartoonScene3D.jsx   # Three.js scene (login + dashboard)
        │   ├── TinyScene3D.jsx      # Mini 3D icons (safe, bag, bomb…)
        │   ├── ImageUpload.jsx      # Drag & drop multi-images
        │   ├── MissionCard.jsx      # Carte mission avec cover image
        │   ├── Sidebar.jsx          # Sidebar cartoon animée
        │   ├── Topbar.jsx           # Barre de titre + user pill
        │   ├── Layout.jsx
        │   ├── ThemeToggle.jsx      # Bouton clair/sombre
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── ThemeContext.jsx     # Dark/Light mode context
        ├── pages/
        │   ├── Login.jsx            # Page login avec scène 3D
        │   ├── Register.jsx         # Inscription 2 étapes
        │   ├── Dashboard.jsx        # QG + stats 3D + missions récentes
        │   ├── Missions.jsx         # Liste + filtres + recherche
        │   ├── MissionDetail.jsx    # Détail + galerie images + lightbox
        │   ├── CreateMission.jsx    # Wizard 3 étapes + upload images
        │   ├── Criminals.jsx        # Réseau de criminels
        │   ├── Profile.jsx          # Profil + missions créées
        │   ├── Leaderboard.jsx      # Podium animé + classement
        │   └── Admin.jsx            # Panel admin (ban, badge, stats)
        ├── hooks/
        │   └── useAuth.js
        ├── services/
        │   └── api.js               # Axios layer
        └── index.css                # Cartoon design system complet
```

---

## 🚀 Installation rapide

### Option A — Scripts shell (recommandé)

```bash
# 1. Cloner / décompresser le projet
cd crimehub

# 2. Peupler la base (MongoDB doit être démarré)
./seed-db.sh

# 3. Backend (terminal 1)
./start-backend.sh

# 4. Frontend (terminal 2)
./start-frontend.sh
```

### Option B — Commandes manuelles

```bash
# ── MONGODB ──────────────────────────────
# macOS :
brew services start mongodb-community
# Linux :
sudo systemctl start mongod
# Windows :
net start MongoDB
# OU MongoDB Atlas : modifier MONGODB_URI dans backend/.env

# ── BACKEND ──────────────────────────────
cd backend
npm install
npm run seed          # Peuple la DB avec données fictives
npm run dev           # Lance avec nodemon

# ── FRONTEND ─────────────────────────────
cd frontend
npm install
npm start
```

### Option C — Docker Compose

```bash
docker-compose up -d
# Puis seed :
docker exec crimehub-backend node scripts/seed.js
```

---

## 🔑 Comptes de démo (après seed)

| Rôle | Login | Mot de passe |
|------|-------|-------------|
| 😈 Criminel | `ShadowFox` | `password123` |

---

## 🔌 API Endpoints

### Auth
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription → JWT |
| POST | `/api/auth/login` | Connexion → JWT |

### Users
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/users` | ✅ | Tous les criminels |
| GET | `/api/users/stats` | ✅ | Stats globales |
| GET | `/api/users/leaderboard` | ✅ | Top 10 |
| GET | `/api/users/:id` | ✅ | Profil + missions |
| PUT | `/api/users/:id` | ✅ | Modifier profil |
| DELETE | `/api/users/:id` | ✅ | Supprimer compte |
| POST | `/api/users/:id/ban` | 👑 | Bannir / débannir |
| POST | `/api/users/:id/badge` | 👑 | Attribuer badge |

### Events (Missions)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/events` | ✅ | Créer mission (+ images base64) |
| GET | `/api/events` | ✅ | Lister (filtres: type, search) |
| GET | `/api/events/:id` | ✅ | Détail complet + images + participants |
| PUT | `/api/events/:id` | ✅ | Modifier mission |
| DELETE | `/api/events/:id` | ✅ | Supprimer mission |
| POST | `/api/events/:id/join` | ✅ | Rejoindre |
| POST | `/api/events/:id/leave` | ✅ | Quitter |

---

## 🎨 Design System

### Couleurs cartoon
| Nom | Hex | Usage |
|-----|-----|-------|
| Orange | `#FF6B35` | Primaire, CTA, accents |
| Jaune | `#FFD93D` | Admin, badges, highlights |
| Rouge | `#FF2D55` | Danger, bannissement |
| Vert | `#06D6A0` | Succès, participation |
| Bleu | `#118AB2` | Info, liens |
| Violet | `#8338EC` | Secondaire, missions |

### Mode sombre (dark)
- Fond principal : `#111118`
- Cartes : `#1e1e2c`
- Texte : `#f0ede8`

### Mode clair (light)
- Fond principal : `#f0ede8`
- Cartes : `#faf8f5`
- Texte : `#0d0d0d`

### Typographie
- **Titres** : Bangers (Google Fonts) — style comic book
- **Corps** : Nunito 800 — arrondi et lisible
- **Déco** : Permanent Marker — style dessiné à la main

---

## 📷 Gestion des images de mission

Les images sont stockées en **base64** dans MongoDB.

- **Max** : 8 images par mission, 3 MB chacune
- **Types** : plan, cible, gains, équipe, fuite, autre
- **Affichage** : galerie cliquable avec lightbox plein écran
- **Cover** : 1ère image affichée sur la carte de mission
- **Upload** : drag & drop ou clic, aperçu immédiat

```json
{
  "images": [
    {
      "name": "plan-banque.jpg",
      "type": "plan",
      "data": "data:image/jpeg;base64,/9j/4AAQ..."
    }
  ]
}
```

---

## ⚠️ Disclaimer

CrimeHub est une **parodie humoristique et fictive** à 100%.
Aucun crime n'est planifié, encouragé ou réel.
Tous les personnages, missions et organisations sont inventés.
Les autorités peuvent dormir tranquille. 😂

---

*Built with ❤️ and 😈*
