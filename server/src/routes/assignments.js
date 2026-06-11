import { Router } from "express";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { normalizeYear, visibleYearValues } from "../utils/normalize.js";

const router = Router();
router.use(requireAuth);

function cleanResources(resources) {
  if (!Array.isArray(resources)) return [];
  return resources
    .filter((r) => r && (r.kind === "file" || r.kind === "link" || typeof r.url === "string"))
    .slice(0, 20)
    .map((r) => {
      if (r.kind === "file") {
        if (!r.fileId) return null;
        return { kind: "file", label: (r.label || "").trim(), fileId: r.fileId, name: (r.name || "file").trim(), mime: r.mime || "", size: r.size || 0 };
      }
      let url = String(r.url || "").trim();
      if (!url) return null;
      if (!/^https?:\/\//i.test(url)) url = "https://" + url; // tolerate "example.com"
      return { kind: "link", label: (r.label || "").trim(), url };
    })
    .filter(Boolean);
}


// GET /api/assignments
// Instructor: their own assignments with submission counts.
// Student: assignments for their academic year (or "All"), merged with their submission.
router.get("/", async (req, res) => {
  try {
    if (req.user.role === "instructor") {
      const assignments = await Assignment.find({ instructor: req.user._id }).sort({ dueDate: 1 }).lean();
      const counts = await Submission.aggregate([
        { $match: { assignment: { $in: assignments.map((a) => a._id) } } },
        { $group: { _id: "$assignment",
            submitted: { $sum: { $cond: [{ $in: ["$status", ["submitted", "late"]] }, 1, 0] } },
            graded: { $sum: { $cond: [{ $ne: ["$grade", null] }, 1, 0] } } } },
      ]);
      const byId = Object.fromEntries(counts.map((c) => [String(c._id), c]));
      return res.json(assignments.map((a) => ({
        ...a,
        submittedCount: byId[String(a._id)]?.submitted || 0,
        gradedCount: byId[String(a._id)]?.graded || 0,
      })));
    }

    // Student
    const assignments = await Assignment.find({ assignedTo: { $in: visibleYearValues(req.user.academicYear) } })
      .populate("instructor", "name")
      .sort({ dueDate: 1 })
      .lean();
    const subs = await Submission.find({ student: req.user._id }).lean();
    const subByAssignment = Object.fromEntries(subs.map((s) => [String(s.assignment), s]));
    res.json(assignments.map((a) => {
      const sub = subByAssignment[String(a._id)] || null;
      const overdue = !sub?.submittedAt && new Date(a.dueDate) < new Date();
      return { ...a, submission: sub, status: sub?.status && sub.status !== "not_submitted" ? sub.status : (overdue ? "overdue" : "not_submitted") };
    }));
  } catch (err) {
    res.status(500).json({ message: "Could not load assignments.", detail: err.message });
  }
});

// POST /api/assignments — instructor creates a task
router.post("/", requireRole("instructor"), async (req, res) => {
  try {
    const { title, description, type, course, dueDate, maxPoints, assignedTo, resources } = req.body;
    const cleanAssignedTo = normalizeYear(assignedTo) || "All";
    if (!title || !course || !dueDate) {
      return res.status(400).json({ message: "Title, course, and due date are required." });
    }
    const assignment = await Assignment.create({
      title, description, type, course, dueDate, maxPoints, assignedTo: cleanAssignedTo,
      resources: cleanResources(resources),
      instructor: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Could not create the assignment.", detail: err.message });
  }
});

// GET /api/assignments/:id — detail (+ student's own submission if student)
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate("instructor", "name").lean();
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });
    if (req.user.role === "student") {
      const submission = await Submission.findOne({ assignment: assignment._id, student: req.user._id }).lean();
      return res.json({ ...assignment, submission });
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Could not load the assignment.", detail: err.message });
  }
});

// PUT /api/assignments/:id — instructor edits their assignment
router.put("/:id", requireRole("instructor"), async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user._id },
      { $set: { ...req.body, ...(req.body.assignedTo ? { assignedTo: normalizeYear(req.body.assignedTo) } : {}), ...(req.body.resources ? { resources: cleanResources(req.body.resources) } : {}) } },
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Could not update the assignment.", detail: err.message });
  }
});

// DELETE /api/assignments/:id — instructor deletes their assignment (and its submissions)
router.delete("/:id", requireRole("instructor"), async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, instructor: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });
    await Submission.deleteMany({ assignment: assignment._id });
    res.json({ message: "Assignment deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete the assignment.", detail: err.message });
  }
});

export default router;
