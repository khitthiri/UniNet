import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mime: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    data: { type: String, required: true }, 
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
