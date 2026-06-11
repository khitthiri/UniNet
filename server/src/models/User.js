import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["student", "instructor"], required: true },
    // System-generated unique ID for every user (login + display)
    uid: { type: String, unique: true, sparse: true, trim: true, uppercase: true },
    // Student information — academic year/level (only for students)
    academicYear: {
      type: String,
      enum: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
      required: function () { return this.role === "student"; },
    },
    department: { type: String, trim: true }, // optional, mainly for instructors
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
