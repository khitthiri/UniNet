import { Router } from "express";
import File from "../models/File.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const MAX_BASE64 = 6_000_000; 

router.post("/", async (req, res) => {
  try {
    const { name, mime, data, size } = req.body;
    if (!name || !data) return res.status(400).json({ message: "A file name and data are required." });
    const clean = String(data).replace(/^data:[^;]+;base64,/, "");
    if (clean.length > MAX_BASE64) return res.status(413).json({ message: "File is too large. Max 4MB." });

    const file = await File.create({ name, mime: mime || "application/octet-stream", size: size || 0, data: clean, owner: req.user._id });
    res.status(201).json({ id: file._id, name: file.name, mime: file.mime, size: file.size });
  } catch (err) {
    res.status(500).json({ message: "Could not upload the file.", detail: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id).lean();
    if (!file) return res.status(404).json({ message: "File not found." });
    res.json({ name: file.name, mime: file.mime, size: file.size, data: file.data });
  } catch (err) {
    res.status(500).json({ message: "Could not load the file.", detail: err.message });
  }
});

export default router;
