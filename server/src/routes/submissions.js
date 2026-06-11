import { Router } from "express";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { normalizeYear } from "../utils/normalize.js";

const router = Router();
router.use(requireAuth);

function cleanAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .filter((a) => a && (a.kind === "link" || a.kind === "file"))
    .slice(0, 20)
    .map((a) => {
      if (a.kind === "link") {
        let url = String(a.url || "").trim();
        if (!url) return null;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        return { kind: "link", label: (a.label || "").trim(), url };
      }
      if (!a.fileId) return null;
      return { kind: "file", fileId: a.fileId, name: (a.name || "file").trim(), mime: a.mime || "", size: a.size || 0 };
    })
    .filter(Boolean);
}


// GET /api/submissions/assignment/:assignmentId — instructor: full roster for one assignment
// Includes students who haven't submitted yet, so nothing is missed.
router.get("/assignment/:assignmentId", requireRole("instructor"), async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, instructor: req.user._id }).lean();
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    const studentFilter = { role: "student" };
    const target = normalizeYear(assignment.assignedTo);
    if (target !== "All") studentFilter.academicYear = target;
    const students = await User.find(studentFilter).select("name email academicYear uid").lean();

    const subs = await Submission.find({ assignment: assignment._id }).lean();
    const byStudent = Object.fromEntries(subs.map((s) => [String(s.student), s]));

    const roster = students.map((st) => {
      const sub = byStudent[String(st._id)] || null;
      const overdue = !sub?.submittedAt && new Date(assignment.dueDate) < new Date();
      return {
        student: st,
        submission: sub,
        status: sub?.status && sub.status !== "not_submitted" ? sub.status : (overdue ? "overdue" : "not_submitted"),
      };
    });
    res.json({ assignment, roster });
  } catch (err) {
    res.status(500).json({ message: "Could not load submissions.", detail: err.message });
  }
});

// POST /api/submissions/:assignmentId/submit — student submits work
// Status is computed on the server: "late" if past the due date, otherwise "submitted".
router.post("/:assignmentId/submit", requireRole("student"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    const now = new Date();
    const status = now > assignment.dueDate ? "late" : "submitted";
    const { content = "", studentNote = "", attachments = [] } = req.body;
    const cleanAtt = cleanAttachments(attachments);

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: req.user._id },
      { $set: { content, studentNote, status, submittedAt: now, attachments: cleanAtt } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: "Could not submit your work.", detail: err.message });
  }
});

// PUT /api/submissions/:assignmentId/student-note — student updates their note any time
router.put("/:assignmentId/student-note", requireRole("student"), async (req, res) => {
  try {
    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.assignmentId, student: req.user._id },
      { $set: { studentNote: req.body.studentNote || "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Could not save your note.", detail: err.message });
  }
});

// PUT /api/submissions/:assignmentId/grade — instructor grades + leaves a note
router.put("/:assignmentId/grade", requireRole("instructor"), async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, instructor: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    const { studentId, grade, instructorNote } = req.body;
    if (grade != null && (grade < 0 || grade > assignment.maxPoints)) {
      return res.status(400).json({ message: `Grade must be between 0 and ${assignment.maxPoints}.` });
    }

    const update = { instructorNote: instructorNote ?? "" };
    if (grade != null) {
      update.grade = grade;
      update.gradedAt = new Date();
    }

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: studentId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("student", "name email academicYear");
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Could not save the grade.", detail: err.message });
  }
});

// GET /api/submissions/my-grades — student: graded work overview for performance tracking
router.get("/my-grades", requireRole("student"), async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user._id, grade: { $ne: null } })
      .populate({ path: "assignment", select: "title course type maxPoints dueDate" })
      .sort({ gradedAt: -1 })
      .lean();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Could not load your grades.", detail: err.message });
  }
});

// GET /api/submissions/instructor/analytics — grade-rate analysis across the instructor's classes
router.get("/instructor/analytics", requireRole("instructor"), async (req, res) => {
  try {
    const assignments = await Assignment.find({ instructor: req.user._id })
      .select("title course maxPoints").lean();
    const aById = Object.fromEntries(assignments.map((a) => [String(a._id), a]));
    const subs = await Submission.find({
      assignment: { $in: assignments.map((a) => a._id) },
      grade: { $ne: null },
    }).lean();

    const pct = (s) => {
      const a = aById[String(s.assignment)];
      return a && a.maxPoints ? (s.grade / a.maxPoints) * 100 : null;
    };
    const all = subs.map(pct).filter((v) => v != null);
    const mean = (arr) => (arr.length ? Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) : null);

    // per course
    const courseMap = {};
    for (const a of assignments) (courseMap[a.course] ||= { course: a.course, assignmentIds: new Set(), pcts: [] }).assignmentIds.add(String(a._id));
    for (const s of subs) {
      const a = aById[String(s.assignment)];
      const p = pct(s);
      if (a && p != null) courseMap[a.course].pcts.push(p);
    }
    const byCourse = Object.values(courseMap).map((c) => ({
      course: c.course,
      avgPercent: mean(c.pcts),
      gradedCount: c.pcts.length,
      assignmentCount: c.assignmentIds.size,
    })).sort((x, y) => (y.avgPercent ?? -1) - (x.avgPercent ?? -1));

    // per assignment
    const asgMap = {};
    for (const s of subs) {
      const p = pct(s);
      if (p == null) continue;
      (asgMap[String(s.assignment)] ||= []).push(p);
    }
    const byAssignment = assignments
      .filter((a) => asgMap[String(a._id)])
      .map((a) => ({ id: a._id, title: a.title, course: a.course, avgPercent: mean(asgMap[String(a._id)]), gradedCount: asgMap[String(a._id)].length }));

    res.json({
      overall: { avgPercent: mean(all), gradedCount: all.length, courseCount: byCourse.length },
      byCourse,
      byAssignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load analytics.", detail: err.message });
  }
});

export default router;
