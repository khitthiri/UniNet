import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["assignment", "exam"], default: "assignment" },
    course: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    maxPoints: { type: Number, required: true, min: 1, default: 100 },
    resources: [{
      kind: { type: String, enum: ["link", "file"], default: "link" },
      label: { type: String, trim: true, default: "" },
      url: { type: String, trim: true, default: "" },               
      fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, 
      name: { type: String, trim: true, default: "" },
      mime: { type: String, trim: true, default: "" },
      size: { type: Number, default: 0 },
    }],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: {
      type: String,
      enum: ["All", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
      default: "All",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
