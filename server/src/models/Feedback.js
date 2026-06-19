import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  
    course: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null }, 
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
