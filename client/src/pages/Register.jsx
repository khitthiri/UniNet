import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { IcCap } from "../components/Icons.jsx";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const presetRole = location.state?.role || "student";

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: presetRole,
    academicYear: "Freshman", department: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async () => {
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === "instructor" ? "/instructor" : "/student");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the account.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-base-200 grid place-items-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="surface w-full max-w-md p-7 sm:p-8">
        <Link to="/welcome" className="inline-flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center">
            <IcCap width={18} height={18} stroke="#fff" />
          </div>
          <span className="font-extrabold text-[18px] tracking-tight">UniNet</span>
        </Link>

        <h1 className="text-[26px] font-bold">Create your account</h1>

        <div className="relative grid grid-cols-2 bg-base-200 rounded-full p-1 mt-5">
          <motion.div layout transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-base-100 rounded-full shadow-card"
            style={{ left: form.role === "student" ? 4 : "calc(50%)" }} />
          {["student", "instructor"].map((r) => (
            <button key={r} className={`relative z-10 py-1.5 text-[14px] font-semibold capitalize transition-colors ${form.role === r ? "" : "opacity-50"}`}
              onClick={() => setForm({ ...form, role: r })}>{r}</button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="text-[13px] font-medium text-[#d70015] bg-[#ff3b30]/10 rounded-xl px-3 py-2 mt-4 overflow-hidden">{error}</motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 space-y-3">
          <input placeholder="Full name" className="input w-full" value={form.name} onChange={set("name")} />
          <input type="email" placeholder="Email" className="input w-full" value={form.email} onChange={set("email")} />
          <input type="password" placeholder="Password (6+ characters)" className="input w-full" value={form.password} onChange={set("password")} />
          <AnimatePresence mode="wait">
            {form.role === "student" ? (
              <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <p className="text-[12px] font-semibold opacity-50 mb-1 ml-1">Academic year</p>
                <select className="select w-full" value={form.academicYear} onChange={set("academicYear")}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <p className="text-[12px] opacity-40 mt-2 ml-1">A unique student ID will be created for you automatically.</p>
              </motion.div>
            ) : (
              <motion.div key="i" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <input placeholder="Department (optional)" className="input w-full" value={form.department} onChange={set("department")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary w-full mt-5" onClick={submit} disabled={busy}>
          {busy ? <span className="loading loading-spinner loading-sm" /> : "Create account"}
        </motion.button>
        <p className="text-[13px] text-center mt-4 opacity-70">
          Already have an account? <Link to="/login" state={{ role: form.role }} className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
