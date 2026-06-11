import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { IcCap } from "../components/Icons.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role; // chosen on the Welcome screen
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      const user = await login(form.identifier, form.password);
      navigate(user.role === "instructor" ? "/instructor" : "/student");
    } catch (err) {
      setError(err.response?.data?.message || "Sign-in failed. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-base-200 grid place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="surface w-full max-w-sm p-7 sm:p-8">
        <Link to="/welcome" className="inline-flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center">
            <IcCap width={18} height={18} stroke="#fff" />
          </div>
          <span className="font-extrabold text-[18px] tracking-tight">UniNet</span>
        </Link>

        <h1 className="text-[26px] font-bold">Sign in</h1>
        {role && (
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-primary/10 text-primary mt-2 capitalize">
            as {role}
          </span>
        )}

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="text-[13px] font-medium text-[#d70015] bg-[#ff3b30]/10 rounded-xl px-3 py-2 mt-4 overflow-hidden">{error}</motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 space-y-3">
          <input type="text" placeholder="Email or ID" className="input w-full" value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
          <input type="password" placeholder="Password" className="input w-full" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>

        <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary w-full mt-5" onClick={submit} disabled={busy}>
          {busy ? <span className="loading loading-spinner loading-sm" /> : "Sign in"}
        </motion.button>
        <p className="text-[13px] text-center mt-4 opacity-70">
          New here? <Link to="/register" state={{ role }} className="text-primary font-medium hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}
