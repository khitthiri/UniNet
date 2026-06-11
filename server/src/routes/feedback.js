import { Router } from "express";
import Feedback from "../models/Feedback.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { visibleYearValues } from "../utils/normalize.js";

const router = Router();
router.use(requireAuth);

// GET /api/feedback/instructors — instructors (and their courses) a student can give feedback to.
// Derived from the assignments visible to the student.
router.get("/instructors", requireRole("student"), async (req, res) => {
  try {
    const assignments = await Assignment.find({ assignedTo: { $in: visibleYearValues(req.user.academicYear) } })
      .populate("instructor", "name uid department")
      .select("instructor course")
      .lean();
    const map = new Map();
    for (const a of assignments) {
      if (!a.instructor) continue;
      const key = String(a.instructor._id);
      if (!map.has(key)) map.set(key, { ...a.instructor, courses: new Set() });
      if (a.course) map.get(key).courses.add(a.course);
    }
    res.json([...map.values()].map((i) => ({ id: i._id, name: i.name, uid: i.uid, department: i.department, courses: [...i.courses] })));
  } catch (err) {
    res.status(500).json({ message: "Could not load instructors.", detail: err.message });
  }
});

// POST /api/feedback — student sends feedback to an instructor
router.post("/", requireRole("student"), async (req, res) => {
  try {
    const { to, course = "", rating = null, message } = req.body;
    if (!to || !message?.trim()) return res.status(400).json({ message: "Choose an instructor and write your feedback." });
    const instructor = await User.findOne({ _id: to, role: "instructor" });
    if (!instructor) return res.status(404).json({ message: "Instructor not found." });
    const fb = await Feedback.create({ from: req.user._id, to, course, rating: rating || null, message: message.trim() });
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: "Could not send your feedback.", detail: err.message });
  }
});

// GET /api/feedback/mine — feedback the student has given
router.get("/mine", requireRole("student"), async (req, res) => {
  try {
    const list = await Feedback.find({ from: req.user._id }).populate("to", "name uid").sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Could not load your feedback.", detail: err.message });
  }
});

// GET /api/feedback — feedback an instructor has received (+ summary)
router.get("/", requireRole("instructor"), async (req, res) => {
  try {
    const list = await Feedback.find({ to: req.user._id }).populate("from", "name uid academicYear").sort({ createdAt: -1 }).lean();
    const rated = list.filter((f) => f.rating != null);
    const avg = rated.length ? Math.round((rated.reduce((s, f) => s + f.rating, 0) / rated.length) * 10) / 10 : null;
    res.json({ list, summary: { count: list.length, avgRating: avg, ratedCount: rated.length } });
  } catch (err) {
    res.status(500).json({ message: "Could not load feedback.", detail: err.message });
  }
});

export default router;
