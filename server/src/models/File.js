import mongoose from "mongoose";

// Small file storage kept inside MongoDB as base64. Keeps the app deployable on the
// forever-free stack without a separate object store. Capped at ~4MB per file.
const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mime: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    data: { type: String, required: true }, // base64 (no data: prefix)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
