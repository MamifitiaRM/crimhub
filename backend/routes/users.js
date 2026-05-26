const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  getStats,
  getLeaderboard,
  setBadge,
} = require("../controllers/userController");

// GET /api/users/stats
router.get("/stats", auth, getStats);

// GET /api/users/leaderboard
router.get("/leaderboard", auth, getLeaderboard);

// GET /api/users
router.get("/", auth, getAllUsers);

// GET /api/users/:id
router.get("/:id", auth, getUserById);

// PUT /api/users/:id
router.put("/:id", auth, updateUser);

// DELETE /api/users/:id
router.delete("/:id", auth, deleteUser);

// POST /api/users/:id/ban (admin)
router.post("/:id/ban", auth, adminAuth, banUser);

// POST /api/users/:id/badge (admin)
router.post("/:id/badge", auth, adminAuth, setBadge);

module.exports = router;
