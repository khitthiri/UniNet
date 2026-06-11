import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["assignment", "exam"], default: "assignment" },
    course: { type: String, required: true, trim: true },
    // Due date for the task
    dueDate: { type: Date, required: true },
    maxPoints: { type: Number, required: true, min: 1, default: 100 },
    // Clickable resource links the instructor attaches (briefs, readings, exam portals)
    resources: [{
      kind: { type: String, enum: ["link", "file"], default: "link" },
      label: { type: String, trim: true, default: "" },
      url: { type: String, trim: true, default: "" },               // for kind=link
      fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, // for kind=file
      name: { type: String, trim: true, default: "" },
      mime: { type: String, trim: true, default: "" },
      size: { type: Number, default: 0 },
    }],
    // The instructor who assigned it
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Which academic year/level it is assigned to ("All" = every student)
    assignedTo: {
      type: String,
      enum: ["All", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
      default: "All",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
