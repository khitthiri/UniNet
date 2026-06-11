import mongoose from "mongoose";

// Feedback a student gives to an instructor about their teaching.
const feedbackSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // student
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // instructor
    course: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null }, // optional 1–5 stars
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
