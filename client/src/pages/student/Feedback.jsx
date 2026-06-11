import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client.js";
import { PageHeader, Panel } from "../../components/Page.jsx";
import StarRating from "../../components/StarRating.jsx";
import { IcMessage } from "../../components/Icons.jsx";

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function StudentFeedback() {
  const [instructors, setInstructors] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ to: "", course: "", rating: 0, message: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadMine = () => api.get("/api/feedback/mine").then((r) => setMine(r.data));
  useEffect(() => {
    Promise.all([api.get("/api/feedback/instructors").then((r) => setInstructors(r.data)), loadMine()]).finally(() => setLoading(false));
  }, []);

  const selected = instructors.find((i) => i.id === form.to);

  const send = async () => {
    setMsg(null);
    if (!form.to || !form.message.trim()) return setMsg({ type: "error", text: "Choose an instructor and write your feedback." });
    setBusy(true);
    try {
      await api.post("/api/feedback", { to: form.to, course: form.course, rating: form.rating || null, message: form.message.trim() });
      setForm({ to: "", course: "", rating: 0, message: "" });
      await loadMine();
      setMsg({ type: "success", text: "Feedback sent to your instructor." });
    } catch (err) { setMsg({ type: "error", text: err.response?.data?.message || "Could not send your feedback." }); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-4xl mx-auto">
      <PageHeader title="Feedback" subtitle="Share feedback with your instructors about their teaching" />

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
          <Panel title="Give feedback">
            {instructors.length === 0 ? (
              <p className="text-[13px] opacity-50 py-6 text-center">Once you have assignments from an instructor, you'll be able to send them feedback here.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-semibold mb-1.5">Instructor</p>
                  <select className="select w-full" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value, course: "" })}>
                    <option value="">Choose an instructor…</option>
                    {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}{i.uid ? ` (${i.uid})` : ""}</option>)}
                  </select>
                </div>
                {selected && selected.courses.length > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold mb-1.5">Course <span className="opacity-40 font-normal">(optional)</span></p>
                    <select className="select w-full" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                      <option value="">General teaching</option>
                      {selected.courses.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-semibold mb-1.5">Rating <span className="opacity-40 font-normal">(optional)</span></p>
                  <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold mb-1.5">Your feedback</p>
                  <textarea className="textarea w-full min-h-28 text-[15px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="What's working well in their teaching style, and what could be better? Be specific and constructive." />
                </div>
                <AnimatePresence>
                  {msg && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className={`text-[13px] font-medium rounded-xl px-3 py-2 overflow-hidden ${msg.type === "success" ? "text-[#1d8a3c] bg-[#34c759]/10" : "text-[#d70015] bg-[#ff3b30]/10"}`}>{msg.text}</motion.div>}
                </AnimatePresence>
                <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary px-6" onClick={send} disabled={busy}>
                  {busy ? <span className="loading loading-spinner loading-sm" /> : "Send feedback"}
                </motion.button>
              </div>
            )}
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2">
          <Panel title="Feedback you've sent">
            {mine.length === 0 ? (
              <div className="py-8 text-center"><IcMessage width={28} height={28} className="mx-auto opacity-20" /><p className="text-[13px] opacity-40 mt-2">Nothing sent yet.</p></div>
            ) : (
              <div className="space-y-3">
                {mine.map((f) => (
                  <div key={f._id} className="rounded-2xl bg-base-200 p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[14px]">{f.to?.name}</p>
                      {f.rating && <span className="text-[12px] font-bold text-[#b8860b]">{"★".repeat(f.rating)}</span>}
                    </div>
                    <p className="text-[12px] opacity-50">{f.course || "General"} · {fmt(f.createdAt)}</p>
                    <p className="text-[13px] mt-1.5 leading-relaxed whitespace-pre-wrap">{f.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
