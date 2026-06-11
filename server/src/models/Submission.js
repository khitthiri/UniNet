import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Submission status: not_submitted | submitted | late
    status: {
      type: String,
      enum: ["not_submitted", "submitted", "late"],
      default: "not_submitted",
    },
    submittedAt: { type: Date },
    content: { type: String, default: "" }, // written answer text (optional now)
    // Files and links the student attaches as their answer
    attachments: [{
      kind: { type: String, enum: ["link", "file"], required: true },
      label: { type: String, trim: true, default: "" }, // shown for links
      url: { type: String, trim: true, default: "" },    // for kind=link
      fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, // for kind=file
      name: { type: String, trim: true, default: "" },   // original filename
      mime: { type: String, trim: true, default: "" },
      size: { type: Number, default: 0 },
    }],
    // Grading by the instructor
    grade: { type: Number, min: 0, default: null },
    gradedAt: { type: Date },
    // Notes from both sides to support evaluation
    studentNote: { type: String, default: "" },
    instructorNote: { type: String, default: "" },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);
