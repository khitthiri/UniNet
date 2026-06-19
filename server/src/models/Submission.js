import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["not_submitted", "submitted", "late"],
      default: "not_submitted",
    },
    submittedAt: { type: Date },
    content: { type: String, default: "" }, 
    attachments: [{
      kind: { type: String, enum: ["link", "file"], required: true },
      label: { type: String, trim: true, default: "" }, 
      url: { type: String, trim: true, default: "" },    
      fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, 
      name: { type: String, trim: true, default: "" },  
      mime: { type: String, trim: true, default: "" },
      size: { type: Number, default: 0 },
    }],
    grade: { type: Number, min: 0, default: null },
    gradedAt: { type: Date },
    studentNote: { type: String, default: "" },
    instructorNote: { type: String, default: "" },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);
