const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
} = require("../controllers/eventController");

// POST /api/events
router.post("/", auth, createEvent);

// GET /api/events
router.get("/", auth, getAllEvents);

// GET /api/events/:id
router.get("/:id", auth, getEventById);

// PUT /api/events/:id
router.put("/:id", auth, updateEvent);

// DELETE /api/events/:id
router.delete("/:id", auth, deleteEvent);

// POST /api/events/:id/join
router.post("/:id/join", auth, joinEvent);

// POST /api/events/:id/leave
router.post("/:id/leave", auth, leaveEvent);

module.exports = router;
