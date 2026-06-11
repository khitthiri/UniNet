import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client.js";
import { PageHeader } from "../../components/Page.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { IcArrow } from "../../components/Icons.jsx";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "todo", label: "To do" },
  { key: "done", label: "Submitted" },
  { key: "graded", label: "Graded" },
];
const fmt = (d) => new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function StudentAssignments() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/api/assignments").then((r) => setItems(r.data)).finally(() => setLoading(false)); }, []);

  const visible = useMemo(() => items.filter((a) => {
    const q = query.trim().toLowerCase();
    if (q && !`${a.title} ${a.course}`.toLowerCase().includes(q)) return false;
    if (filter === "todo") return ["not_submitted", "overdue"].includes(a.status);
    if (filter === "done") return ["submitted", "late"].includes(a.status);
    if (filter === "graded") return a.submission?.grade != null;
    return true;
  }), [items, filter, query]);

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-5xl mx-auto">
      <PageHeader title="Assignments" subtitle="Every task and exam assigned to you" />

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="inline-flex bg-base-content/[0.05] rounded-full p-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className="relative px-4 py-1.5 text-[13px] font-semibold rounded-full">
              {filter === f.key && <motion.span layoutId="s-filter" transition={{ type: "spring", stiffness: 400, damping: 32 }} className="absolute inset-0 bg-base-100 rounded-full shadow-card" />}
              <span className={`relative z-10 ${filter === f.key ? "" : "opacity-50"}`}>{f.label}</span>
            </button>
          ))}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assignments…"
          className="input flex-1 min-w-[180px] max-w-xs" />
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visible.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="surface py-14 text-center">
              <p className="font-semibold text-[15px]">Nothing here</p>
              <p className="text-[13px] opacity-50 mt-1">Try a different filter, or check back when your instructors post new work.</p>
            </motion.div>
          )}
          {visible.map((a) => {
            const overdue = a.status === "overdue";
            return (
              <motion.div key={a._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                whileHover={{ y: -3 }}>
                <Link to={`/student/assignments/${a._id}`} className="surface flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-40">{a.type} · {a.course}</p>
                    <p className="font-semibold text-[16px] mt-0.5 truncate">{a.title}</p>
                    <p className={`text-[13px] mt-0.5 ${overdue ? "text-[#d70015] font-medium" : "opacity-50"}`}>Due {fmt(a.dueDate)} · {a.maxPoints} pts</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={a.status} />
                    {a.submission?.grade != null && <span className="text-[15px] font-bold text-primary">{a.submission.grade}<span className="opacity-40 font-medium">/{a.maxPoints}</span></span>}
                  </div>
                  <IcArrow width={18} height={18} className="opacity-25 shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
