import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { generateUid } from "../utils/ids.js";

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(u) {
  return {
    id: u._id,
    uid: u.uid,
    name: u.name,
    email: u.email,
    role: u.role,
    academicYear: u.academicYear,
    department: u.department,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, academicYear, department } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }
    if (role === "student" && !academicYear) {
      return res.status(400).json({ message: "Select your academic year." });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });

    const uid = await generateUid(User, role); // unique ID for every student & instructor
    const user = await User.create({ name, email, password, role, academicYear, department, uid });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Could not create the account.", detail: err.message });
  }
});

// POST /api/auth/login — accepts an email OR a unique ID, plus password.
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const id = (identifier || email || "").trim();
    if (!id) return res.status(400).json({ message: "Enter your email or ID." });

    const user = await User.findOne({
      $or: [{ email: id.toLowerCase() }, { uid: id.toUpperCase() }],
    });
    if (!user || !(await user.comparePassword(password || ""))) {
      return res.status(401).json({ message: "Email/ID or password is incorrect." });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Sign-in failed.", detail: err.message });
  }
});

// GET /api/auth/me — restore session on refresh
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
